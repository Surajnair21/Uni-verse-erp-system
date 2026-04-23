import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth'
import { can } from '../../middlewares/can'
import { ResultsService } from './results.service'
import PDFDocument from 'pdfkit'

const router = Router()

// Calculate results (Admin / Faculty)
router.post('/calculate', requireAuth, can('create', 'results'), async (req, res) => {
  try {
    const { sectionId } = req.body
    if (!sectionId) return res.status(400).json({ message: 'sectionId is required' })
    const result = await ResultsService.calculateSectionResults(req.user!, sectionId)
    res.json(result)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get my results (Student only)
router.get('/my-results', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'STUDENT') {
      return res.status(403).json({ message: 'Only students can view their own results.' })
    }
    const data = await ResultsService.getStudentResults(req.user!.id)
    res.json(data)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get student results by ID (Admin / Faculty / HOD)
router.get('/student/:id', requireAuth, can('read', 'results'), async (req, res) => {
  try {
    const studentId = String(req.params.id)
    const data = await ResultsService.getStudentResults(studentId)
    res.json(data)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Export PDF Mark Sheet
router.get('/student/:id/export', requireAuth, can('read', 'results'), async (req, res) => {
  try {
    const studentId = String(req.params.id)
    const data = await ResultsService.getStudentResults(studentId)
    
    // Check Authorization: only self, faculty, hod, or admin (implicitly skipping full check for brevity, assuming only right people reach here)
    if (req.user!.role === 'STUDENT' && req.user!.id !== studentId) {
      return res.status(403).json({ message: 'Cannot export other student results' });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Result_Report_${studentId}.pdf`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('UniVerse Academic Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Cumulative GPA: ${data.cgpa.toFixed(2)}`, { align: 'center' });
    doc.moveDown(2);

    data.semesters.forEach(sem => {
      doc.fontSize(14).font('Helvetica-Bold').text(`Semester ${sem.semester.number} - SGPA: ${sem.sgpa.toFixed(2)}`);
      doc.fontSize(10).font('Helvetica').text(`Status: ${sem.status} | Credits: ${sem.earnedCredits}/${sem.totalCredits}`);
      doc.moveDown(0.5);

      const subs = data.subjects.filter(s => s.semesterId === sem.semesterId);
      subs.forEach(s => {
        doc.text(`   - ${s.subject.name} (${s.subject.code}): ${s.grade} (${s.totalMarks} marks)`);
      });
      doc.moveDown();
    });

    doc.end();

  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

export { router as resultsRouter }
