import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const exportToPDF = (data: any[], filename = 'report.pdf') => {
  const doc = new jsPDF()

  if (data.length === 0) {
    doc.text('No data to display', 10, 10)
  } else {
    const headers = Object.keys(data[0])
    const body = data.map((row) => headers.map((h) => row[h]))
    autoTable(doc, { head: [headers], body })
  }

  doc.save(filename)
}
