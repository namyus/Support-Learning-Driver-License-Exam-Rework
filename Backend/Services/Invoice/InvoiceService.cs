using AutoMapper;
using Backend.DB.Models;
using Backend.DTO.Invoice;
using Backend.Repository.ClassRepository;
using Backend.Repository.ClassStudentRepository;
using Backend.Repository.CourseRepository;
using Backend.Repository.InvoiceRepository;
using Backend.Repository.MemberRepository;
using Backend.Repository.StaffRepository;
using Backend.Repository.StudentRepository;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Invoice
{
    public class InvoiceService : IInvoiceService
    {
        private readonly DrivingLicenseContext _context;
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly IStaffRepository _staffRepository;
        private readonly IClassRepository _classRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly IMapper _mapper;

        public InvoiceService(DrivingLicenseContext context
            , IInvoiceRepository invoiceRepository
            , IStudentRepository studentRepository
            , IMemberRepository memberRepository
            , ICourseRepository courseRepository
            , IStaffRepository staffRepository
            , IClassRepository classRepository
            , IClassStudentRepository classStudentRepository
            , IMapper mapper)
        {
            _context = context;
            _invoiceRepository = invoiceRepository;
            _studentRepository = studentRepository;
            _memberRepository = memberRepository;
            _courseRepository = courseRepository;
            _staffRepository = staffRepository;
            _classRepository = classRepository;
            _classStudentRepository = classStudentRepository;
            _mapper = mapper;
        }

        public ServiceResult<ICollection<InvoiceDTO>> GetAllInvoices()
        {
            var result = new ServiceResult<ICollection<InvoiceDTO>>();
            try
            {
                var invoices = _invoiceRepository.GetAll()
                    .Include(i => i.Staff.User)
                    .Include(i => i.Member.User);
                if (!invoices.Any())
                {
                    result.IsError = true;
                    result.ErrorMessage = "Không tìm thấy hóa đơn!";
                }

                result.Payload = _mapper.Map<ICollection<InvoiceDTO>>(invoices);
            }
            catch (Exception e)
            {
                result.IsError = true;
                result.ErrorMessage = e.Message;
            }
            return result;
        }

        public async Task<ServiceResult<InvoiceDTO>> GetInvoiceByStudentId(string studentId)
        {
            var result = new ServiceResult<InvoiceDTO>();
            try
            {
                var student = await _studentRepository.GetByIdAsync(studentId);
                if (student is null)
                {
                    result.IsError = true;
                    result.ErrorMessage = "Không tìm thấy học viên!";
                    return result;
                }

                var invoice = await _invoiceRepository.GetAll()
                    .Include(i => i.Staff.User)
                    .Include(i => i.Member.User)
                    .Where(i => i.CourseId == student.CourseId && i.MemberId == student.MemberId)
                    .FirstOrDefaultAsync();
                result.Payload = _mapper.Map<InvoiceDTO>(invoice);
            }
            catch (Exception e)
            {
                result.IsError = true;
                result.ErrorMessage = e.Message;
            }
            return result;
        }

        public async Task<ServiceResult<ICollection<InvoiceDTO>>> GetInvoiceByMemberId(int memberId)
        {
            var result = new ServiceResult<ICollection<InvoiceDTO>>();
            try
            {
                var member = await _memberRepository.GetMemberById(memberId);
                if (member is null)
                {
                    result.IsError = true;
                    result.ErrorMessage = "Không tìm thấy học viên!";
                    return result;
                }

                var invoices = await _invoiceRepository.GetAll()
                    .Include(i => i.Staff.User)
                    .Include(i => i.Member.User)
                    .Where(i => i.MemberId == memberId)
                    .ToListAsync();
                result.Payload = _mapper.Map<ICollection<InvoiceDTO>>(invoices);
            }
            catch (Exception e)
            {
                result.IsError = true;
                result.ErrorMessage = e.Message;
            }
            return result;
        }

        public async Task<ServiceResult<int>> CreateInvoice(InvoiceCreateDTO invoiceCreateDto)
        {
            var result = new ServiceResult<int>();
            try
            {
                var member = await _memberRepository.GetMemberById(invoiceCreateDto.MemberId);
                if (member is null)
                {
                    result.IsError = true;
                    result.Payload = -1;
                    result.ErrorMessage = "Học viên không tồn tại!";
                    return result;
                }

                var staff = await _staffRepository.GetByIdAsync(invoiceCreateDto.StaffId);
                if (staff is null)
                {
                    result.IsError = true;
                    result.Payload = -1;
                    result.ErrorMessage = "Nhân viên không tồn tại!";
                    return result;
                }

                var course = await _courseRepository.GetByIdAsync(member.CourseId);
                if (course is null)
                {
                    result.IsError = true;
                    result.Payload = -1;
                    result.ErrorMessage = "Khóa học không tồn tại!";
                    return result;
                }

                if (invoiceCreateDto.AmountPaid != course.CourseFee)
                {
                    result.IsError = true;
                    result.Payload = -2;
                    result.ErrorMessage = "Số tiền thanh toán không giống học phí niêm yết! " + (course.CourseFee);
                    return result;
                }

                var existInvoice = await _invoiceRepository.GetAll()
                    .Where(i => i.CourseId == member.CourseId && i.MemberId == invoiceCreateDto.MemberId)
                    .FirstOrDefaultAsync();
                if (existInvoice != null || member.IsPaid == true)
                {
                    result.IsError = true;
                    result.Payload = -2;
                    result.ErrorMessage = "Khóa học đã được học viên thanh toán";
                    return result;
                }

                var existStudent = await _studentRepository
                    .GetAll()
                    .FirstOrDefaultAsync(i => i.CourseId == course.CourseId && i.MemberId == member.MemberId);
                if (existStudent != null)
                {
                    result.IsError = true;
                    result.Payload = -2;
                    result.ErrorMessage = "Học viên đã tồn tại";
                    return result;
                }

                var theoryClass = await _classRepository
                    .GetAll()
                    .FirstOrDefaultAsync(i => i.CourseId == course.CourseId && i.IsTheoryClass == true);
                if (theoryClass == null)
                {
                    result.IsError = true;
                    result.Payload = 0;
                    result.ErrorMessage = "Không tìm thấy lớp học lý thuyết";
                    return result;
                }

                var strategy = _context.Database.CreateExecutionStrategy();
                await strategy.ExecuteAsync(async () =>
                {
                    await using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        var invoice = _mapper.Map<DB.Models.Invoice>(invoiceCreateDto);
                        invoice.CourseId = member.CourseId;
                        invoice.InvoiceTime = DateTime.Now;
                        await _invoiceRepository.AddAsync(invoice);

                        await AddMemberIntoCourse(course, member, theoryClass);

                        await transaction.CommitAsync();
                    }
                    catch
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                });
            }
            catch (Exception e)
            {
                result.IsError = true;
                result.Payload = 0;
                result.ErrorMessage = e.Message;
            }
            return result;
        }

        private async Task AddMemberIntoCourse(
            DB.Models.Course course,
            DB.Models.Member member,
            DB.Models.Class theoryClass)
        {
            try
            {
                var courseId = course.CourseId;
                var memberId = member.MemberId;

                member.IsPaid = true;
                await _memberRepository.UpdateAsync(member);

                var existStudent = await _studentRepository
                    .GetAll()
                    .FirstOrDefaultAsync(i => i.CourseId == courseId && i.MemberId == memberId);
                if (existStudent != null)
                {
                    throw new Exception("Học viên đã tồn tại");
                }

                var numberOfStudents = await _studentRepository
                    .GetAll()
                    .Where(i => i.CourseId == courseId)
                    .CountAsync();

                var student = new DB.Models.Student
                {
                    StudentId = courseId + "." + (numberOfStudents < 9
                        ? "0" + (numberOfStudents + 1)
                        : (numberOfStudents + 1).ToString()),
                    MemberId = memberId,
                    CourseId = courseId,
                    TotalKm = 0,
                    TotalHour = 0,
                };
                await _studentRepository.CreateAsync(student);

                course.NumberOfStudents = numberOfStudents + 1;
                await _courseRepository.UpdateAsync(course);

                var classStudent = new DB.Models.ClassStudent
                {
                    ClassId = theoryClass.ClassId,
                    StudentId = student.StudentId,
                    Status = true,
                };

                await _classStudentRepository.CreateAsync(classStudent);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }
    }
}
