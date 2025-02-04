// Image rendering function
function renderImageFromElement(element, base64Data) {
  if (!element || !base64Data) {
    element.innerHTML = '<p class="error">No image data available</p>';
    return;
  }

  try {
    const decoded = decodeURIComponent(base64Data);
    const cleaned = cleanBase64(decoded);
    const binaryString = atob(cleaned);
    const uint8Array = new Uint8Array(
      binaryString.split("").map((char) => char.charCodeAt(0)),
    );
    const decompressedData = pako.inflate(uint8Array);
    const blob = new Blob([decompressedData], {
      type: "image/png",
    });
    const imageUrl = URL.createObjectURL(blob);

    const imgElement = document.createElement("img");
    imgElement.src = imageUrl;
    element.textContent = "";
    element.appendChild(imgElement);

    imgElement.onload = () => URL.revokeObjectURL(imageUrl);
  } catch (error) {
    console.error("Failed to render image:", error);
    element.innerHTML =
      '<p class="error">Error loading image. The data may be corrupted.</p>';
  }
}

// PDF rendering function
function renderPDFElement(element, base64Data) {
  if (!element || !base64Data) {
    element.innerHTML = '<p class="error">No PDF data available</p>';
    return;
  }

  try {
    const binaryData = atob(base64Data);
    const uint8Array = new Uint8Array(
      binaryData.split("").map((char) => char.charCodeAt(0)),
    );
    const decompressedData = pako.inflate(uint8Array);

    let binary = "";
    decompressedData.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    const base64PDF = btoa(binary);
    const pdfDataUrl = `data:application/pdf;base64,${base64PDF}`;

    const container = document.createElement("div");
    container.innerHTML = `
                    <object type="application/pdf" width="100%" height="600px" data="${pdfDataUrl}">
                        <p>Your browser doesn't support embedded PDFs.
                           <a href="${pdfDataUrl}" class="pdf-download" download="document.pdf">Download the PDF</a> instead.
                        </p>
                    </object>`;

    element.innerHTML = "";
    element.appendChild(container);
  } catch (error) {
    console.error("Failed to render PDF:", error);
    element.innerHTML =
      '<p class="error">Error loading PDF. The data may be corrupted.</p>';
  }
}

// Initialize elements when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize images
  document
    .querySelectorAll(".question-image, .solution-image")
    .forEach((element) => {
      const base64Data = element.getAttribute("data-compressed");
      renderImageFromElement(element, base64Data);
    });

  // Initialize PDFs
  document.querySelectorAll(".paper-pdf").forEach((element) => {
    const base64Data = element.getAttribute("data-compressed");
    renderPDFElement(element, base64Data);
  });
});

// Utility function for base64 handling
function cleanBase64(str) {
  str = str.replace(/[^A-Za-z0-9+/=]/g, "");
  if (str.length % 4 !== 0) {
    str = str.padEnd(str.length + (4 - (str.length % 4)), "=");
  }
  return str;
}
