import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

// 🟢 Excel (يدعم Multi-Sheet)
export const exportToExcel = (sheets, fileName = "report") => {
  const workbook = XLSX.utils.book_new();

  // 👇 لو جالك Array of sheets
  if (Array.isArray(sheets)) {
    sheets.forEach(({ sheet, data }) => {
      const ws = XLSX.utils.json_to_sheet(data || []);
      XLSX.utils.book_append_sheet(workbook, ws, sheet || "Sheet");
    });
  } else {
    // 👇 fallback (Sheet واحدة)
    const ws = XLSX.utils.json_to_sheet(sheets || []);
    XLSX.utils.book_append_sheet(workbook, ws, "Report");
  }

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const file = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  saveAs(file, `${fileName}.xlsx`);
};


// 🔴 PDF (Logo + Title + حماية من empty)
export const exportToPDF = (data, title = "Report", options = {}) => {
  const { logo } = options;

  const doc = new jsPDF();

  // 🖼️ Logo
  if (logo) {
    doc.addImage(logo, "PNG", 14, 10, 30, 15);
  }

  // 📝 Title
  doc.setFontSize(14);
  doc.text(title, 14, logo ? 30 : 15);

  if (!data || data.length === 0) {
    doc.text("No data available", 14, 40);
    doc.save(`${title}.pdf`);
    return;
  }

  const columns = Object.keys(data[0]);
  const rows = data.map(obj => Object.values(obj));

  doc.autoTable({
    head: [columns],
    body: rows,
    startY: logo ? 35 : 20
  });

  doc.save(`${title}.pdf`);
};