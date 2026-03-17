export function getLetterTemplate({
  registrarName,
  date,
  studentName,
  studentId,
  department,
  program,
  academicYear,
  documentType,
  description,
  universityName = 'Bule Hora University',
  universityAddress = 'P.O. Box 144, Bule Hora, Ethiopia',
  universityEmail = 'info@bulehorauniversity.edu.et',
  registrarContact = `Registrar's Office, Bule Hora University, Email: ${universityEmail}` 
}) {
  return `${universityName}
${universityAddress}

Date: ${date}

To,
The Revenue Department
[Revenue Department Address]

Subject: Verification of Student Enrollment and Request for Revenue Documentation – ${studentName} (ID: ${studentId})

Dear Sir/Madam,

This is to certify that **${studentName}** (Student ID: **${studentId}**) is a bona fide student of ${universityName}, enrolled in the **${program}** program within the **${department}** department for the academic year **${academicYear}**.

The student has requested the following document for revenue‑related purposes: **${documentType}**. The stated purpose is:  
"${description}"

This letter is issued in support of the student's application for the above‑mentioned purpose. We kindly request your office to process the request and provide the necessary documentation or take appropriate action as per applicable regulations.

Should you require any further information or verification, please do not hesitate to contact the undersigned.

Thank you for your cooperation.

Yours faithfully,

${registrarName}
Registrar
${universityName}
${registrarContact}`;
}
