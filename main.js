let pdfBytes = null;
const {
    PDFDocument,
    StandardFonts,
    rgb
} = PDFLib

let pdfDoc = null;
let pngImage = null;
let jpgImage = null;

let existingPdfBytes = null;
let pngImageBytes = null;
let jpgImageBytes = null;

let width = 200;
let height = 200;

let firmando = false;

let x1 = 90;
let y1 = 190;

let page1 = 0;

async function AgregarFirma() {
    firmando = true;
    x1 = 90;
    y1 = 190;
    page1 = 0;
    await embedImages();
}

async function IncrementarPagina() {
    page1++;
    await embedImages();
}

async function DisminuirPagina() {
    if (page1 > 0) page1--;
    await embedImages();
}

async function AchicarFirma() {
    width = width - 30;
    await embedImages();
}

async function AgrandarFirma() {
    width = width + 30;
    await embedImages();
}

async function MoverAbajo() {
    y1 = y1 - 30;
    await embedImages();
}

async function MoverArriba() {
    y1 = y1 + 30;
    await embedImages();
}

async function MoverDerecha() {
    x1 = x1 + 30;
    await embedImages();
}

async function MoverIzquierda() {
    x1 = x1 - 30;
    await embedImages();
}


async function ResetContents() {
    pdfDoc = await PDFDocument.load(existingPdfBytes);
    if (pngImageBytes) {
        pngImage = await pdfDoc.embedPng(pngImageBytes);
        const pngDims = pngImage.scale(1);
        let factor = width / pngDims.width;
        height = pngDims.height * factor;
    } else {
        if (jpgImageBytes) {
            jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
            const jpgDims = jpgImage.scale(1);
            let factor = width / jpgDims.width;
            height = jpgDims.height * factor;
        }
    }
}

async function AppendPDFBytes(pdfBytes) {
    if (existingPdfBytes) {
        const newPDF = await PDFDocument.load(pdfBytes);
        const copiedPagesA = await pdfDoc.copyPages(newPDF, newPDF.getPageIndices());
        copiedPagesA.forEach((page) => pdfDoc.addPage(page));
        existingPdfBytes = await pdfDoc.save();

    } else {
        existingPdfBytes = pdfBytes;
    }
}

document.getElementById('input_pdf').addEventListener('change', function() {
    var reader = new FileReader();
    reader.onload = async function() {
        let newPdfBytes = new Uint8Array(reader.result);
        await AppendPDFBytes(newPdfBytes);
        await embedImages();
    }
    reader.readAsArrayBuffer(this.files[0]);
}, false);

document.getElementById('input_png').addEventListener('change', function() {
    var reader = new FileReader();
    let type = null;
    reader.onload = async function() {
        if (type == "image/jpeg") {
            jpgImageBytes = new Uint8Array(reader.result);
        } else {
            pngImageBytes = new Uint8Array(reader.result);
        }
    }

    let img = this.files[0];
    type = img.type;
    reader.readAsArrayBuffer(img);
}, false);

async function embedImages() {
    await ResetContents();
    DrawOnPage(page1, x1, y1);
    await UpdateViewer();
}


function DrawOnPage(page, x, y) {
    if (pngImageBytes) {
        pdfDoc.getPages()[page].drawImage(pngImage, {
            x,
            y,
            width,
            height
        });
    }
    if (jpgImageBytes) {
        pdfDoc.getPages()[page].drawImage(jpgImage, {
            x,
            y,
            width,
            height
        });
    }
}

async function UpdateViewer() {
    const pdfDataUri = await pdfDoc.saveAsBase64({
        dataUri: true
    });
    var iframe = document.querySelectorAll('iframe')[0];
    iframe.src = pdfDataUri;
}

async function SetFirma() {
    firmando = false;
    existingPdfBytes = await pdfDoc.save();
    await embedImages();
}

async function Save() {
    pdfBytes = await pdfDoc.save()
    download(pdfBytes, "pdf-lib_image_embedding_example.pdf", "application/pdf");
}


async function createPdf() {
    pdfDoc = await PDFDocument.create();
    existingPdfBytes = await pdfDoc.save();
    await embedImages();
}