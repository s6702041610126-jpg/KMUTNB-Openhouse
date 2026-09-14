// Staff codes for KMUTNB Open House 2026
// Each faculty has its own Staff Code — used to login and display the faculty QR Code

export const STAFF_CODES = {
  'industrial-ed':       'FTE2024',
  'applied-arts':        'FAA2024',
  'arch-design':         'ARCH2024',
  'cit':                 'CIT2024',
  'applied-science':     'SCI2024',
  'engineering':         'ENG2024',
  'business-dev':        'BID2024',
  'international-college': 'IC2024',
  'it-digital':          'ITD2024',
};

// QR payload signature — used by the student side to verify this QR is from the real system
export const QR_SIGNATURE = 'KMUTNB-OPENHOUSE-2026';

// Generate QR payload string for students to scan
export function generateFacultyQRPayload(facultyId, facultyCode) {
  return JSON.stringify({
    type: 'FACULTY_CHECKIN',
    facultyId,
    facultyCode,
    signature: QR_SIGNATURE,
    ts: Math.floor(Date.now() / 60000), // rotate every 1 minute (anti-screenshot replay)
  });
}

// Validate QR payload scanned by a student
export function validateFacultyQR(rawData) {
  try {
    const data = JSON.parse(rawData);
    if (
      data.type === 'FACULTY_CHECKIN' &&
      data.signature === QR_SIGNATURE &&
      data.facultyId &&
      typeof data.ts === 'number'
    ) {
      // Accept QR codes created within the last 5 minutes
      const now = Math.floor(Date.now() / 60000);
      if (Math.abs(now - data.ts) <= 5) {
        return { valid: true, facultyId: data.facultyId, facultyCode: data.facultyCode };
      } else {
        return { valid: false, reason: 'QR Code has expired (> 5 minutes)' };
      }
    }
    return { valid: false, reason: 'Invalid QR Code' };
  } catch {
    return { valid: false, reason: 'Invalid QR Code format' };
  }
}
