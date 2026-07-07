'use client';

import React, { useRef } from 'react';
import { Download, FileText, Printer, FileSpreadsheet } from 'lucide-react';
import { SELF_ASSESSMENT_QUESTIONS, LEADERSHIP_EVALUATION_QUESTIONS_20 } from '@/lib/assessment-data';
import * as XLSX from 'xlsx';

export function FinalRevealView({ data }: { data: any }) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!data || !data.details) {
    return <div className="p-8 text-center text-text-muted">No data available</div>;
  }

  const { self, evals, appr, user, period } = data.details;
  const profile = user?.user_profiles?.[0] || {};
  
  // Safe eval access
  const ev1 = evals && evals.length > 0 ? evals[0] : null;
  const ev2 = evals && evals.length > 1 ? evals[1] : null;
  const ev3 = evals && evals.length > 2 ? evals[2] : null;

  // -- CALCULATIONS FOR 20% (PEERS) --
  let peerTotalWeight = 0;
  let peerTotalScore = 0;
  let ev1Total = 0;
  let ev2Total = 0;
  let ev3Total = 0;

  const peerRows = LEADERSHIP_EVALUATION_QUESTIONS_20.flatMap(category => 
    category.questions.map(q => {
      const w = q.weight;
      peerTotalWeight += w;
      
      const s1 = ev1?.responses?.[q.question_id];
      const s2 = ev2?.responses?.[q.question_id];
      const s3 = ev3?.responses?.[q.question_id];
      
      if (s1) ev1Total += s1 * w;
      if (s2) ev2Total += s2 * w;
      if (s3) ev3Total += s3 * w;

      let validScores = 0;
      let sumScores = 0;
      if (s1 !== undefined) { validScores++; sumScores += s1; }
      if (s2 !== undefined) { validScores++; sumScores += s2; }
      if (s3 !== undefined) { validScores++; sumScores += s3; }

      const avgRaw = validScores > 0 ? sumScores / validScores : 0;
      const score = avgRaw * w;
      peerTotalScore += score;

      return {
        id: q.question_id,
        criteria: q.criteria,
        weight: w,
        s1: s1 || '-',
        s2: s2 || '-',
        s3: s3 || '-',
        avgRaw: avgRaw.toFixed(2),
        score: score.toFixed(2)
      };
    })
  );

  const peer20 = peerTotalScore / 5; // scaled from 100 to 20

  // -- CALCULATIONS FOR 10% (SELF) --
  let selfTotalWeight = 0;
  let selfTotalScore = 0;

  const selfRows = SELF_ASSESSMENT_QUESTIONS.flatMap(category => 
    category.questions.map(q => {
      const w = q.weight;
      selfTotalWeight += w;
      
      const sRaw = self?.responses?.[q.question_id];
      const score = sRaw ? sRaw * w : 0;
      selfTotalScore += score;

      return {
        id: q.question_id,
        criteria: q.criteria,
        weight: w,
        raw: sRaw || '-',
        score: score.toFixed(2)
      };
    })
  );

  const self10 = selfTotalScore / 10; // scaled from 100 to 10
  
  // -- CALCULATIONS FOR 70% (APPROVER) --
  const appr70 = Number(appr?.score_70 || 0);

  // -- SUMS --
  const sum30 = peer20 + self10;
  const final100 = sum30 + appr70;

  const getGrade = (s: number) => {
    if (s >= 90) return 'በጣም ከፍተኛ';
    if (s >= 80) return 'ከፍተኛ';
    if (s >= 70) return 'መካከለኛ';
    return 'ዝቅተኛ';
  };

  const grade = getGrade(final100);

  // --- EXPORT FUNCTIONS ---
  const handlePrintPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Create data array for Peer
    const peerData = [
      ['የሰራተኛ የአፈጻጸም ግምገማ ቅጽ'],
      ['የሰራተኛው ስም', user?.full_name, 'የተገመገመበት ቀን', new Date().toLocaleDateString('am-ET')],
      ['የስራ መደብ', profile.system_role || 'Member', 'የክፍል ስም', '-'],
      [],
      ['ከ 20% ግምገማ (ሦስት ገምጋሞች)'],
      ['ተ.ቁ', 'የግምገማ መስፈርቶች', 'ክብደት', 'ገምጋሚ 1', 'ገምጋሚ 2', 'ገምጋሚ 3', 'አማካይ', 'ውጤት']
    ];

    LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(c => {
      peerData.push([c.category_id, c.category_name, '', '', '', '', '', '']);
      c.questions.forEach(q => {
        const row = peerRows.find(r => r.id === q.question_id);
        if (row) {
          peerData.push([row.id, row.criteria, row.weight, row.s1, row.s2, row.s3, row.avgRaw, row.score]);
        }
      });
    });

    peerData.push(['ወደ 20% ሲቀየር', '', peerTotalWeight, (ev1Total/5).toFixed(2), (ev2Total/5).toFixed(2), (ev3Total/5).toFixed(2), '', peer20.toFixed(2)]);
    
    peerData.push([]);
    peerData.push(['ከ 10% ግምገማ (የራስ ግምገማ)']);
    peerData.push(['ተ.ቁ', 'የግምገማ መስፈርቶች', 'ክብደት', 'ደረጃ', 'ውጤት', 'ምርመራ']);
    
    selfRows.forEach(r => {
      peerData.push([r.id, r.criteria, r.weight, r.raw, r.score, '']);
    });
    peerData.push(['ወደ 10% ሲቀየር', '', selfTotalWeight, '', self10.toFixed(2), '']);
    
    peerData.push([]);
    peerData.push(['የግምገማ ማጠቃለያ']);
    peerData.push(['ከ 10 ያገኘው ውጤት', self10.toFixed(2)]);
    peerData.push(['ከ 20 ያገኘው ውጤት', peer20.toFixed(2)]);
    peerData.push(['ከ 30 ያገኘው ድምር (20+10)', sum30.toFixed(2)]);
    peerData.push(['የበላይ ኃላፊ (ከ 70%)', appr70.toFixed(2)]);
    peerData.push(['ከ 100 የተገኘው ውጤት', final100.toFixed(2)]);
    peerData.push(['የውጤት ደረጃ', grade]);

    const ws = XLSX.utils.aoa_to_sheet(peerData);
    XLSX.utils.book_append_sheet(wb, ws, "Evaluation Report");
    XLSX.writeFile(wb, `${user?.full_name}_Evaluation.xlsx`);
  };

  const handleExportWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Export HTML to Word Document</title>
    <style>table { border-collapse: collapse; width: 100%; margin-bottom: 20px; } th, td { border: 1px solid black; padding: 5px; text-align: left; font-size: 12px; } h1, h2 { font-size: 16px; }</style>
    </head><body>`;
    const footer = `</body></html>`;
    const sourceHTML = header + document.getElementById("printable-report")?.innerHTML + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${user?.full_name}_Evaluation.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Controls - Hidden on Print */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-center premium-card p-4 border border-border shadow-sm gap-4">
        <h2 className="text-xl font-heading font-semibold text-text-primary">የግምገማ ሪፖርት ማውረጃ (Report Export)</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button onClick={handleExportWord} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" /> Word
          </button>
          <button onClick={handlePrintPDF} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div id="printable-report" className="bg-white text-black p-4 sm:p-12 shadow-2xl print:shadow-none print:p-0 mx-auto w-full max-w-5xl border border-border/50 print:border-none print:m-0 overflow-x-auto" ref={printRef}>
        
        {/* Document Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-heading mb-4">የሰራተኛ የአፈጻጸም ግምገማ ቅጽ</h1>
        </div>

        <table className="w-full text-sm border-collapse border border-black mb-8 min-w-[600px]">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-bold bg-gray-100 w-1/4">የግምገማው ዓይነት</td>
              <td className="border border-black p-2 w-1/4">{period?.name || 'ዓመታዊ - 6 ወር'}</td>
              <td className="border border-black p-2 font-bold bg-gray-100 w-1/4">ዕለት</td>
              <td className="border border-black p-2 w-1/4">{new Date().toLocaleDateString('am-ET')}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold bg-gray-100">የሰራተኛው ስም</td>
              <td className="border border-black p-2 font-bold">{user?.full_name}</td>
              <td className="border border-black p-2 font-bold bg-gray-100">የተገመገመበት ቀን</td>
              <td className="border border-black p-2">{new Date().toLocaleDateString('am-ET')}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold bg-gray-100">የስራ መደብ</td>
              <td className="border border-black p-2">{profile.system_role || 'Member'}</td>
              <td className="border border-black p-2 font-bold bg-gray-100">የተገመገመበት ሰዓት</td>
              <td className="border border-black p-2">-</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold bg-gray-100">የክፍል ስም</td>
              <td className="border border-black p-2">-</td>
              <td className="border border-black p-2 font-bold bg-gray-100">ገምጋሚ 1 / 2 / 3</td>
              <td className="border border-black p-2 text-xs">
                {ev1?.evaluator?.full_name || '-'} / {ev2?.evaluator?.full_name || '-'} / {ev3?.evaluator?.full_name || '-'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 20% Peer Evaluation */}
        <h2 className="text-md font-bold mb-2">ከ 20% ግምገማ (ሦስት ገምጋሞች)</h2>
        <table className="w-full text-sm border-collapse border border-black mb-8 min-w-[600px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 w-12 text-center">ተ.ቁ</th>
              <th className="border border-black p-2 text-left">የግምገማ መስፈርቶች</th>
              <th className="border border-black p-2 w-16 text-center">ክብደት</th>
              <th className="border border-black p-2 w-16 text-center">ገም. 1</th>
              <th className="border border-black p-2 w-16 text-center">ገም. 2</th>
              <th className="border border-black p-2 w-16 text-center">ገም. 3</th>
              <th className="border border-black p-2 w-16 text-center">አማካይ</th>
              <th className="border border-black p-2 w-16 text-center">ውጤት</th>
              <th className="border border-black p-2 w-20 text-center">ምርመራ</th>
            </tr>
          </thead>
          <tbody>
            {LEADERSHIP_EVALUATION_QUESTIONS_20.map((cat) => (
              <React.Fragment key={cat.category_id}>
                <tr className="bg-gray-50 font-bold">
                  <td className="border border-black p-2 text-center">{cat.category_id}</td>
                  <td className="border border-black p-2" colSpan={8}>{cat.category_id}. {cat.category_name}</td>
                </tr>
                {cat.questions.map(q => {
                  const row = peerRows.find(r => r.id === q.question_id);
                  if (!row) return null;
                  return (
                    <tr key={q.question_id}>
                      <td className="border border-black p-2 text-center">{row.id}</td>
                      <td className="border border-black p-2 text-xs">{row.criteria}</td>
                      <td className="border border-black p-2 text-center font-semibold">{row.weight}</td>
                      <td className="border border-black p-2 text-center">{row.s1}</td>
                      <td className="border border-black p-2 text-center">{row.s2}</td>
                      <td className="border border-black p-2 text-center">{row.s3}</td>
                      <td className="border border-black p-2 text-center bg-gray-50">{row.avgRaw}</td>
                      <td className="border border-black p-2 text-center font-bold">{row.score}</td>
                      <td className="border border-black p-2"></td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
            <tr className="font-bold bg-gray-100">
              <td className="border border-black p-2 text-right" colSpan={2}>ወደ 20% ሲቀየር</td>
              <td className="border border-black p-2 text-center">{peerTotalWeight}</td>
              <td className="border border-black p-2 text-center">{(ev1Total/5).toFixed(2)}</td>
              <td className="border border-black p-2 text-center">{(ev2Total/5).toFixed(2)}</td>
              <td className="border border-black p-2 text-center">{(ev3Total/5).toFixed(2)}</td>
              <td className="border border-black p-2 text-center">{(peerTotalScore/100*20).toFixed(2)}</td>
              <td className="border border-black p-2 text-center text-lg">{peer20.toFixed(2)}</td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>

        {/* 10% Self Evaluation */}
        <div className="break-before-page"></div>
        <h2 className="text-md font-bold mb-2 mt-8">ከ 10% ግምገማ (የራስ ግምገማ)</h2>
        <table className="w-full text-sm border-collapse border border-black mb-8 min-w-[600px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 w-12 text-center">ተ.ቁ</th>
              <th className="border border-black p-2 text-left">የግምገማ መስፈርቶች</th>
              <th className="border border-black p-2 w-16 text-center">ክብደት</th>
              <th className="border border-black p-2 w-16 text-center">ደረጃ</th>
              <th className="border border-black p-2 w-16 text-center">ውጤት</th>
              <th className="border border-black p-2 w-20 text-center">ምርመራ</th>
            </tr>
          </thead>
          <tbody>
            {selfRows.map(row => (
              <tr key={row.id}>
                <td className="border border-black p-2 text-center">{row.id}</td>
                <td className="border border-black p-2 text-xs">{row.criteria}</td>
                <td className="border border-black p-2 text-center font-semibold">{row.weight}</td>
                <td className="border border-black p-2 text-center">{row.raw}</td>
                <td className="border border-black p-2 text-center font-bold">{row.score}</td>
                <td className="border border-black p-2"></td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-100">
              <td className="border border-black p-2 text-right" colSpan={2}>ወደ 10% ሲቀየር</td>
              <td className="border border-black p-2 text-center">{selfTotalWeight}</td>
              <td className="border border-black p-2 text-center"></td>
              <td className="border border-black p-2 text-center text-lg">{self10.toFixed(2)}</td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>

        {/* Final Summary */}
        <h2 className="text-md font-bold mb-2">የግምገማ ማጠቃለያ</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <table className="w-full md:w-1/2 text-sm border-collapse border border-black">
            <tbody>
              <tr><td className="border border-black p-2 font-bold bg-gray-100">የተገመገመው ሰው ስም</td><td className="border border-black p-2 font-bold">{user?.full_name}</td></tr>
              <tr><td className="border border-black p-2 font-bold bg-gray-100">ከ 10 ያገኘው ውጤት (የራስ)</td><td className="border border-black p-2 font-bold">{self10.toFixed(2)}</td></tr>
              <tr><td className="border border-black p-2 font-bold bg-gray-100">ከ 20 ያገኘው ውጤት (አቻ)</td><td className="border border-black p-2 font-bold">{peer20.toFixed(2)}</td></tr>
              <tr><td className="border border-black p-2 font-bold bg-brand-blue/10 text-brand-blue">ከ 30 ያገኘው ድምር (20 + 10)</td><td className="border border-black p-2 font-bold text-brand-blue bg-brand-blue/10">{sum30.toFixed(2)}</td></tr>
              <tr><td className="border border-black p-2 font-bold bg-gray-100">የበላይ ኃላፊ (ከ 70)</td><td className="border border-black p-2 font-bold">{appr70.toFixed(2)}</td></tr>
              <tr><td className="border border-black p-3 font-bold bg-gray-200 text-lg">ከ 100 የተገኘው ውጤት</td><td className="border border-black p-3 font-bold text-lg bg-gray-50">{final100.toFixed(2)}%</td></tr>
              <tr><td className="border border-black p-2 font-bold bg-gray-100">የውጤት ደረጃ</td><td className="border border-black p-2 font-bold text-brand-blue">{grade}</td></tr>
            </tbody>
          </table>

          <div className="w-full md:w-1/2">
            <table className="w-full text-sm border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100"><th className="border border-black p-2 text-left" colSpan={2}>የውጤት አሰጣጥ መመሪያ</th></tr>
              </thead>
              <tbody>
                <tr><td className="border border-black p-2 font-bold">1. በጣም ከፍተኛ</td><td className="border border-black p-2">ከ 90% እስከ 100%</td></tr>
                <tr><td className="border border-black p-2 font-bold">2. ከፍተኛ</td><td className="border border-black p-2">ከ 80% እስከ 89%</td></tr>
                <tr><td className="border border-black p-2 font-bold">3. መካከለኛ</td><td className="border border-black p-2">ከ 70% እስከ 79%</td></tr>
                <tr><td className="border border-black p-2 font-bold">4. ዝቅተኛ</td><td className="border border-black p-2">ከ 70% በታች</td></tr>
              </tbody>
            </table>
            
            <div className="mt-8">
              <p className="font-bold mb-6">የተገመገመው ሰው ፊርማ: _________________________</p>
              <p className="font-bold mb-6">የበላይ ኃላፊ ፊርማ: _________________________</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
