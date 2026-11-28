# **Welcome to FDriving - An online project**
### **You will find in this repository a group project with the followings features:**
- Create a course
- Enroll into a course
- Login
- Create lessons for a course
- Take a final theory exam
- ...

### **Database Setup**
The canonical database script is `Others/DrivingLicense_2026_2027.sql` (compatible with SQL Server 2022 and Azure SQL Database Query Editor). It contains two independently executable sections:
1. **Mode A — Fresh Installation**: Run on an empty database to create all 21 tables, constraints, roles, and sanitized 2026–2027 demo data (9 courses, 54 `CourseDetails`). Re-running on an existing database aborts safely without duplicating data.
2. **Mode B — Existing Azure Demo Upgrade**: Highlight and run only Section 2 on an existing Azure SQL demo database to safely shift the 9 whitelisted demo courses (`1101B2`–`0103B2`) from 2023–2024 to 2026–2027 without modifying users, members, students, invoices, or other records.
3. **Manual Credential Provisioning**: No plaintext or shared demo passwords are stored in the public SQL script. After running Mode A, set private account passwords manually as documented at the top of `Others/DrivingLicense_2026_2027.sql`.
  
### **Screenshots**
![image](https://github.com/Stayer1231/Support-Learning-Driver-License-Exam/assets/89825940/e93c92c1-9805-48f1-a99d-58d3f5b32e78)

![image](https://github.com/Stayer1231/Support-Learning-Driver-License-Exam/assets/89825940/08c4c070-640d-420a-a3f9-d6e908a5dd26)

![image](https://github.com/Stayer1231/Support-Learning-Driver-License-Exam/assets/89825940/ac6fe6d0-50bd-493f-bb6c-f9f7566e427a)

![image](https://github.com/Stayer1231/Support-Learning-Driver-License-Exam/assets/89825940/63a65124-beb4-459b-ad44-874bbc55d7b3)

![image](https://github.com/Stayer1231/Support-Learning-Driver-License-Exam/assets/89825940/53cab50c-d266-42f5-b579-61feb7daf3e4)

![image](https://github.com/Stayer1231/Support-Learning-Driver-License-Exam/assets/89825940/d89b5e22-5beb-40d7-a194-3f62bd7d645d)

![image](https://github.com/Stayer1231/Support-Learning-Driver-License-Exam/assets/89825940/cfd88760-3a1d-4d27-8076-a2262094f3e4)

![image](https://github.com/Stayer1231/Support-Learning-Driver-License-Exam/assets/89825940/99f51931-1bcf-474b-8ad6-841c0d420305)
