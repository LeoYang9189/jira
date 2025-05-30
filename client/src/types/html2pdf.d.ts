declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: { 
      scale: number; 
      useCORS: boolean; 
      allowTaint: boolean; 
      backgroundColor: string;
      [key: string]: any;
    };
    jsPDF?: { 
      unit: string; 
      format: string; 
      orientation: string;
      [key: string]: any;
    };
    pagebreak?: { 
      mode: string; 
      before?: string; 
      after?: string; 
      avoid?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface Html2PdfWorker {
    set(options: Html2PdfOptions): Html2PdfWorker;
    from(element: HTMLElement): Html2PdfWorker;
    save(): Promise<void>;
    toPdf(): Html2PdfWorker;
    get(type: string): any;
    output(type: string): any;
    outputPdf(): any;
  }

  function html2pdf(): Html2PdfWorker;
  function html2pdf(element: HTMLElement, options?: Html2PdfOptions): Html2PdfWorker;

  export = html2pdf;
} 