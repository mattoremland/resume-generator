const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, BorderStyle, WidthType, ShadingType,
  VerticalAlign, TabStop, TabAlignment
} = require('docx');

const fs = require('fs');
const path = require('path');

// ─── COLOR & STYLE CONSTANTS ─────────────────────────────────────────────────
const COLORS = {
  darkBlue: "1B3A5C",
  mediumBlue: "2E6B9E",
  lightGray: "F2F2F2",
  mediumGray: "CCCCCC",
  darkGray: "555555",
  black: "000000"
};

const FONTS = {
  primary: "Calibri",
  secondary: "Calibri"
};

// Page layout: US Letter, 0.6" top/bottom, 0.75" left/right
const PAGE = {
  width: 12240,
  height: 15840,
  marginTop: 864,      // 0.6 inches
  marginBottom: 864,   // 0.6 inches
  marginLeft: 1080,    // 0.75 inches
  marginRight: 1080    // 0.75 inches
};

const CONTENT_WIDTH = PAGE.width - PAGE.marginLeft - PAGE.marginRight; // 10080 DXA

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

function noBorder() {
  return { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
}

function allNoBorders() {
  return { top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() };
}

function sectionHeaderParagraph(text) {
  return new Paragraph({
    spacing: { before: 160, after: 80 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        font: FONTS.primary,
        size: 22,       // 11pt
        color: COLORS.darkBlue
      })
    ]
  });
}

function sectionDivider() {
  // A thin horizontal rule under the section header using a bottom border on an empty paragraph
  return new Paragraph({
    spacing: { before: 0, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.mediumBlue }
    },
    children: []
  });
}

function experienceBullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({
        text: text,
        font: FONTS.primary,
        size: 20,       // 10pt
        color: COLORS.darkGray
      })
    ]
  });
}

// ─── RESUME SECTIONS ─────────────────────────────────────────────────────────

function buildHeader(header) {
  return [
    // Name
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: header.name,
          bold: true,
          font: FONTS.primary,
          size: 56,     // 28pt
          color: COLORS.darkBlue
        })
      ]
    }),
    // Target title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: header.target_title,
          font: FONTS.primary,
          size: 24,     // 12pt
          color: COLORS.mediumBlue,
          italics: true
        })
      ]
    }),
    // Contact line: email | phone | location
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: header.email, font: FONTS.primary, size: 18, color: COLORS.darkGray }),
        new TextRun({ text: "  •  ", font: FONTS.primary, size: 18, color: COLORS.mediumGray }),
        new TextRun({ text: header.phone, font: FONTS.primary, size: 18, color: COLORS.darkGray }),
        new TextRun({ text: "  •  ", font: FONTS.primary, size: 18, color: COLORS.mediumGray }),
        new TextRun({ text: header.location, font: FONTS.primary, size: 18, color: COLORS.darkGray })
      ]
    }),
    // LinkedIn
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: header.linkedin, font: FONTS.primary, size: 18, color: COLORS.mediumBlue })
      ]
    })
  ];
}

function buildSummary(summary) {
  if (!summary) return [];
  return [
    sectionHeaderParagraph("Professional Summary"),
    sectionDivider(),
    new Paragraph({
      spacing: { before: 40, after: 160 },
      children: [
        new TextRun({
          text: summary,
          font: FONTS.primary,
          size: 20,     // 10pt
          color: COLORS.darkGray
        })
      ]
    })
  ];
}

function buildExperience(experience) {
  if (!experience || experience.length === 0) return [];

  let paragraphs = [
    sectionHeaderParagraph("Professional Experience"),
    sectionDivider()
  ];

  experience.forEach((role, index) => {
    // Company + dates on one line using a two-column table row for clean left/right alignment
    paragraphs.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [CONTENT_WIDTH - 2400, 2400],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: allNoBorders(),
                width: { size: CONTENT_WIDTH - 2400, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: [
                  new Paragraph({
                    spacing: { before: index === 0 ? 0 : 200, after: 0 },
                    children: [
                      new TextRun({
                        text: role.company,
                        bold: true,
                        font: FONTS.primary,
                        size: 22,   // 11pt
                        color: COLORS.black
                      })
                    ]
                  })
                ]
              }),
              new TableCell({
                borders: allNoBorders(),
                width: { size: 2400, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: index === 0 ? 0 : 200, after: 0 },
                    children: [
                      new TextRun({
                        text: `${role.start} – ${role.end}`,
                        font: FONTS.primary,
                        size: 20,   // 10pt
                        color: COLORS.darkGray
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    );

    // Title + location on next line
    paragraphs.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [CONTENT_WIDTH - 2400, 2400],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: allNoBorders(),
                width: { size: CONTENT_WIDTH - 2400, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: [
                  new Paragraph({
                    spacing: { before: 40, after: 60 },
                    children: [
                      new TextRun({
                        text: role.title,
                        font: FONTS.primary,
                        size: 20,   // 10pt
                        color: COLORS.mediumBlue,
                        italics: true
                      })
                    ]
                  })
                ]
              }),
              new TableCell({
                borders: allNoBorders(),
                width: { size: 2400, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 40, after: 60 },
                    children: [
                      new TextRun({
                        text: role.location,
                        font: FONTS.primary,
                        size: 18,   // 9pt
                        color: COLORS.darkGray,
                        italics: true
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    );

    // Bullet points
    if (role.bullets && role.bullets.length > 0) {
      role.bullets.forEach(bullet => {
        paragraphs.push(experienceBullet(bullet));
      });
    }
  });

  return paragraphs;
}

function buildEducation(education) {
  if (!education || education.length === 0) return [];

  let paragraphs = [
    sectionHeaderParagraph("Education"),
    sectionDivider()
  ];

  education.forEach((edu) => {
    // Degree + year using left/right alignment table
    paragraphs.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [CONTENT_WIDTH - 1200, 1200],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: allNoBorders(),
                width: { size: CONTENT_WIDTH - 1200, type: WidthType.DXA },
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: [
                  new Paragraph({
                    spacing: { before: 60, after: 20 },
                    children: [
                      new TextRun({
                        text: `${edu.degree} in ${edu.field}`,
                        bold: true,
                        font: FONTS.primary,
                        size: 20,
                        color: COLORS.black
                      })
                    ]
                  })
                ]
              }),
              new TableCell({
                borders: allNoBorders(),
                width: { size: 1200, type: WidthType.DXA },
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 60, after: 20 },
                    children: [
                      new TextRun({
                        text: edu.year,
                        font: FONTS.primary,
                        size: 20,
                        color: COLORS.darkGray
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    );

    // Institution
    paragraphs.push(
      new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({
            text: edu.institution,
            font: FONTS.primary,
            size: 20,
            color: COLORS.mediumBlue,
            italics: true
          })
        ]
      })
    );

    // Optional details
    if (edu.details) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 20, after: 60 },
          children: [
            new TextRun({
              text: edu.details,
              font: FONTS.primary,
              size: 18,
              color: COLORS.darkGray
            })
          ]
        })
      );
    }
  });

  return paragraphs;
}

function buildSkills(skills) {
  if (!skills || skills.length === 0) return [];

  let paragraphs = [
    sectionHeaderParagraph("Skills & Technologies"),
    sectionDivider()
  ];

  skills.forEach((group) => {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 100, after: 40 },
        children: [
          new TextRun({
            text: group.category + ": ",
            bold: true,
            font: FONTS.primary,
            size: 20,
            color: COLORS.black
          }),
          new TextRun({
            text: group.items.join("  •  "),
            font: FONTS.primary,
            size: 20,
            color: COLORS.darkGray
          })
        ]
      })
    );
  });

  return paragraphs;
}

function buildPresentations(presentations) {
  if (!presentations || presentations.length === 0) return [];

  let paragraphs = [
    sectionHeaderParagraph("Presentations & Publications"),
    sectionDivider()
  ];

  presentations.forEach((pres) => {
    const typeLabel = pres.type === "solo" ? "Solo Presenter" :
                      pres.type === "co-presented" ? "Co-Presenter" :
                      "Author";

    paragraphs.push(experienceBullet(
      `${pres.event} (${pres.year}) — ${typeLabel}: ${pres.description}`
    ));
  });

  return paragraphs;
}

function buildPublications(publications) {
  if (!publications || publications.length === 0) return [];

  let paragraphs = [
    sectionHeaderParagraph("Publications"),
    sectionDivider()
  ];

  publications.forEach((pub) => {
    let text = `"${pub.title}" — ${pub.journal}, ${pub.year}`;
    if (pub.note) {
      text += ` (${pub.note})`;
    }
    paragraphs.push(experienceBullet(text));
  });

  return paragraphs;
}

// ─── COVER LETTER ────────────────────────────────────────────────────────────

function buildCoverLetter(coverLetter, header, metadata) {
  if (!coverLetter || !coverLetter.opening) return null;

  // Sanitize cover letter text: remove em dashes
  function sanitizeCL(text) {
    if (!text) return text;
    return text.replace(/[—–]/g, '-');
  }

  let paragraphs = [
    // Date
    new Paragraph({
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: new Date(metadata.date_applied).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }),
          font: FONTS.primary,
          size: 22,
          color: COLORS.darkGray
        })
      ]
    }),
    // Hiring Manager placeholder
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: "Hiring Manager", bold: true, font: FONTS.primary, size: 22, color: COLORS.black })
      ]
    }),
    new Paragraph({
      spacing: { after: 400 },
      children: [
        new TextRun({ text: metadata.target_company, font: FONTS.primary, size: 22, color: COLORS.darkGray })
      ]
    }),
    // Re: line
    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({ text: "Re: ", bold: true, font: FONTS.primary, size: 22, color: COLORS.black }),
        new TextRun({ text: metadata.target_role, font: FONTS.primary, size: 22, color: COLORS.black })
      ]
    }),
    // Opening paragraph
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ text: sanitizeCL(coverLetter.opening), font: FONTS.primary, size: 22, color: COLORS.darkGray })
      ]
    })
  ];

  // Body paragraphs
  if (coverLetter.body) {
    coverLetter.body.forEach(para => {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 200, after: 200 },
          children: [
            new TextRun({ text: sanitizeCL(para), font: FONTS.primary, size: 22, color: COLORS.darkGray })
          ]
        })
      );
    });
  }

  // Closing
  if (coverLetter.closing) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 200, after: 400 },
        children: [
          new TextRun({ text: sanitizeCL(coverLetter.closing), font: FONTS.primary, size: 22, color: COLORS.darkGray })
        ]
      })
    );
  }

  // Sign-off
  paragraphs.push(
    new Paragraph({ spacing: { after: 40 }, children: [
      new TextRun({ text: "Sincerely,", font: FONTS.primary, size: 22, color: COLORS.black })
    ]}),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
    new Paragraph({ children: [
      new TextRun({ text: header.name, bold: true, font: FONTS.primary, size: 22, color: COLORS.black })
    ]})
  );

  return paragraphs;
}

// ─── MAIN DOCUMENT ASSEMBLY ──────────────────────────────────────────────────

function buildResume(data) {
  let children = [
    ...buildHeader(data.header),
    ...buildSummary(data.summary),
    ...buildExperience(data.experience),
    ...buildEducation(data.education),
    ...buildSkills(data.skills),
    ...buildPresentations(data.presentations),
    ...buildPublications(data.publications)
  ];

  return children;
}

function assembleDocument(data) {
  const resumeContent = buildResume(data);

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 540, hanging: 270 } }
            }
          }]
        }
      ]
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: {
              top: PAGE.marginTop,
              bottom: PAGE.marginBottom,
              left: PAGE.marginLeft,
              right: PAGE.marginRight
            }
          }
        },
        children: resumeContent
      }
    ]
  });

  return doc;
}

function assembleCoverLetter(data) {
  const coverLetterContent = buildCoverLetter(data.cover_letter, data.header, data.metadata);
  if (!coverLetterContent) return null;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
          }
        },
        children: coverLetterContent
      }
    ]
  });

  return doc;
}

// ─── ENTRY POINT ─────────────────────────────────────────────────────────────

async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error("Usage: node generate_resume.js <path-to-application.json>");
    process.exit(1);
  }

  // Read and parse the JSON content file
  let data;
  try {
    const raw = fs.readFileSync(inputFile, 'utf8');
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${inputFile}: ${e.message}`);
    process.exit(1);
  }

  // Validate required fields
  const required = ['metadata', 'header', 'summary', 'experience', 'education', 'skills'];
  for (const field of required) {
    if (!data[field]) {
      console.error(`Missing required field: ${field}`);
      process.exit(1);
    }
  }

  // Build the output filename — professional format for the recipient
  const name = data.header.name.replace(/,.*/, '').trim(); // strip credentials after comma
  const company = data.metadata.target_company.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const role = data.metadata.target_role.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const baseFilename = `${name}_${company}_${role}`;

  // Output directories
  const outputDir = path.resolve('output');
  const docxDir = path.join(outputDir, 'docx files');

  const docxPath = path.join(docxDir, `${baseFilename}_resume.docx`);

  // Assemble and write the resume
  const doc = assembleDocument(data);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log(`✓ DOCX written: ${docxPath}`);

  // Assemble and write the cover letter (if present)
  let coverLetterDocxPath = null;
  const clDoc = assembleCoverLetter(data);
  if (clDoc) {
    coverLetterDocxPath = path.join(docxDir, `${baseFilename}_cover_letter.docx`);
    const clBuffer = await Packer.toBuffer(clDoc);
    fs.writeFileSync(coverLetterDocxPath, clBuffer);
    console.log(`✓ Cover letter DOCX written: ${coverLetterDocxPath}`);
  }

  // Output the paths as JSON for the Python wrapper to pick up
  console.log(JSON.stringify({
    docx: docxPath,
    coverLetterDocx: coverLetterDocxPath,
    baseFilename: baseFilename,
    outputDir: outputDir
  }));
}

main().catch(err => {
  console.error("Generator error:", err);
  process.exit(1);
});
