import html2pdf from 'html2pdf.js';
import { DateTimeType } from '../components/Common/DateRangeSelector';
import { PrintDimension } from '../components/Common/PrintReportButton';

export class PrintService {
  
  // 维度配置映射
  private static dimensionConfig: Record<PrintDimension, { 
    label: string; 
    dateTimeType: DateTimeType; 
    description: string 
  }> = {
    'all': { 
      label: '全部维度', 
      dateTimeType: 'created', 
      description: '包含所有时间维度的完整数据分析报告' 
    },
    'created': { 
      label: '创建时间维度', 
      dateTimeType: 'created', 
      description: '按Issue创建时间进行统计分析' 
    },
    'resolutiondate': { 
      label: '设计完成时间维度', 
      dateTimeType: 'completed_design', 
      description: '按设计完成时间进行统计分析' 
    },
    'duedate': { 
      label: '关闭时间维度', 
      dateTimeType: 'closed', 
      description: '按Issue关闭时间进行统计分析' 
    },
    'actualreleasedate': { 
      label: '实际发布日维度', 
      dateTimeType: 'actual_release', 
      description: '按实际发布日期进行统计分析' 
    }
  };

  // 获取当前日期时间字符串
  private static getCurrentDateTime(): string {
    const now = new Date();
    return now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // 创建分隔页面
  private static createSeparatorPage(dimensionKey: PrintDimension): HTMLElement {
    const separatorPage = document.createElement('div');
    separatorPage.style.cssText = `
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      page-break-before: always;
      page-break-after: always;
      text-align: center;
      padding: 40px;
      box-sizing: border-box;
    `;

    const config = this.dimensionConfig[dimensionKey];
    
    separatorPage.innerHTML = `
      <div style="max-width: 600px;">
        <div style="
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 30px auto;
          box-shadow: 0 10px 25px rgba(2, 132, 199, 0.3);
        ">
          <svg width="60" height="60" fill="white" viewBox="0 0 24 24">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm5-18v4h3V3h-3z"/>
          </svg>
        </div>
        
        <h1 style="
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 16px 0;
          font-family: 'Inter', 'Helvetica', sans-serif;
        ">
          ${config.label}
        </h1>
        
        <p style="
          font-size: 18px;
          color: #64748b;
          margin: 0 0 40px 0;
          line-height: 1.6;
          font-family: 'Inter', 'Helvetica', sans-serif;
        ">
          ${config.description}
        </p>
        
        <div style="
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 16px;
          ">
            <div style="
              width: 40px;
              height: 40px;
              background: #f1f5f9;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="20" height="20" fill="#475569" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <span style="
              font-size: 16px;
              font-weight: 600;
              color: #374151;
              font-family: 'Inter', 'Helvetica', sans-serif;
            ">
              数据统计维度
            </span>
          </div>
          
          <div style="
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            font-family: 'Inter', 'Helvetica', sans-serif;
          ">
            以下数据基于<strong style="color: #374151;">${config.label}</strong>进行分析统计
          </div>
        </div>
        
        <div style="
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #9ca3af;
          font-family: 'Inter', 'Helvetica', sans-serif;
        ">
          生成时间: ${this.getCurrentDateTime()}
        </div>
      </div>
    `;

    return separatorPage;
  }

  // 克隆页面内容并准备打印
  private static async preparePageForPrint(): Promise<HTMLElement> {
    // 获取主要内容容器
    const mainContent = document.querySelector('[data-print-content]') || 
                       document.querySelector('main') || 
                       document.querySelector('.MuiContainer-root');
    
    if (!mainContent) {
      throw new Error('找不到可打印的内容区域');
    }

    // 创建打印容器
    const printContainer = document.createElement('div');
    printContainer.style.cssText = `
      width: 100%;
      background: white;
      font-family: 'Inter', 'Helvetica', sans-serif;
      color: #1e293b;
    `;

    // 添加标题页
    const titlePage = this.createTitlePage();
    printContainer.appendChild(titlePage);

    // 克隆主要内容
    const clonedContent = mainContent.cloneNode(true) as HTMLElement;
    
    // 优化打印样式
    this.optimizeForPrint(clonedContent);
    
    printContainer.appendChild(clonedContent);

    return printContainer;
  }

  // 创建标题页
  private static createTitlePage(): HTMLElement {
    const titlePage = document.createElement('div');
    titlePage.style.cssText = `
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      page-break-after: always;
      text-align: center;
      padding: 40px;
      box-sizing: border-box;
    `;

    titlePage.innerHTML = `
      <div style="max-width: 800px;">
        <div style="
          width: 160px;
          height: 160px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 40px auto;
          box-shadow: 0 20px 40px rgba(2, 132, 199, 0.3);
        ">
          <svg width="80" height="80" fill="white" viewBox="0 0 24 24">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm5-18v4h3V3h-3z"/>
          </svg>
        </div>
        
        <h1 style="
          font-size: 48px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 24px 0;
          letter-spacing: -0.5px;
        ">
          JIRA数据分析报告
        </h1>
        
        <p style="
          font-size: 24px;
          color: #64748b;
          margin: 0 0 60px 0;
          line-height: 1.4;
        ">
          项目需求与设计工作量统计分析
        </p>
        
        <div style="
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          max-width: 500px;
          margin: 0 auto;
        ">
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            text-align: left;
          ">
            <div>
              <div style="
                font-size: 14px;
                color: #64748b;
                margin-bottom: 8px;
                font-weight: 500;
              ">
                报告生成时间
              </div>
              <div style="
                font-size: 16px;
                color: #1e293b;
                font-weight: 600;
              ">
                ${this.getCurrentDateTime()}
              </div>
            </div>
            
            <div>
              <div style="
                font-size: 14px;
                color: #64748b;
                margin-bottom: 8px;
                font-weight: 500;
              ">
                数据来源
              </div>
              <div style="
                font-size: 16px;
                color: #1e293b;
                font-weight: 600;
              ">
                JIRA系统
              </div>
            </div>
          </div>
        </div>
        
        <div style="
          margin-top: 60px;
          padding-top: 32px;
          border-top: 1px solid #e2e8f0;
          font-size: 14px;
          color: #9ca3af;
        ">
          此报告由系统自动生成，包含项目需求统计、优先级分布、工作量分析等多维度数据
        </div>
      </div>
    `;

    return titlePage;
  }

  // 优化打印样式
  private static optimizeForPrint(element: HTMLElement): void {
    // 移除导航栏和固定元素
    const elementsToRemove = element.querySelectorAll('nav, .MuiAppBar-root, .MuiBackdrop-root');
    elementsToRemove.forEach(el => el.remove());

    // 处理ECharts图表 - 更全面地查找Canvas元素
    console.log('🔍 开始查找并转换图表Canvas...');
    
    // 方法1: 直接查找所有Canvas元素
    const allCanvasElements = element.querySelectorAll('canvas');
    console.log(`🎨 直接找到 ${allCanvasElements.length} 个Canvas元素`);
    
    let totalConverted = 0;
    
    // 转换所有Canvas元素
    allCanvasElements.forEach((canvas, index) => {
      const htmlCanvas = canvas as HTMLCanvasElement;
      
      try {
        console.log(`🖼️ 正在处理第 ${index + 1} 个Canvas元素...`);
        
        // 检查Canvas是否有内容
        const context = htmlCanvas.getContext('2d');
        if (!context) {
          console.warn(`⚠️ Canvas ${index + 1} 无法获取2D上下文`);
          return;
        }
        
        // 获取Canvas尺寸
        const rect = htmlCanvas.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(htmlCanvas);
        
        console.log(`📏 Canvas ${index + 1} 尺寸: ${rect.width}x${rect.height}`);
        
        // 创建图片替换Canvas
        const img = document.createElement('img');
        
        // 使用高质量转换
        const dataURL = htmlCanvas.toDataURL('image/png', 1.0);
        
        // 检查dataURL是否有效（不是空白图片）
        if (dataURL === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==') {
          console.warn(`⚠️ Canvas ${index + 1} 是空白图片，跳过转换`);
          return;
        }
        
        img.src = dataURL;
        
        // 设置图片样式
        img.style.width = htmlCanvas.style.width || computedStyle.width || `${rect.width}px`;
        img.style.height = htmlCanvas.style.height || computedStyle.height || `${rect.height}px`;
        img.style.maxWidth = '100%';
        img.style.display = 'block';
        img.style.margin = 'auto';
        
        // 添加调试属性
        img.setAttribute('data-original-canvas', 'true');
        img.setAttribute('data-canvas-index', index.toString());
        img.setAttribute('data-canvas-size', `${rect.width}x${rect.height}`);
        
        // 替换Canvas
        const parent = htmlCanvas.parentNode;
        if (parent) {
          parent.replaceChild(img, htmlCanvas);
          totalConverted++;
          console.log(`✅ Canvas ${index + 1} 转换成功 (${rect.width}x${rect.height})`);
        } else {
          console.warn(`⚠️ Canvas ${index + 1} 没有父节点`);
        }
        
      } catch (error) {
        console.error(`❌ Canvas ${index + 1} 转换失败:`, error);
      }
    });
    
    console.log(`📊 Canvas转换完成: ${totalConverted}/${allCanvasElements.length} 个成功转换`);
    
    // 方法2: 查找图表容器并优化
    const chartContainers = element.querySelectorAll('.echarts-for-react, [data-echarts-instance-index], div[_echarts_instance_]');
    console.log(`📈 找到 ${chartContainers.length} 个图表容器`);
    
    chartContainers.forEach((container, index) => {
      const htmlContainer = container as HTMLElement;
      
      // 确保容器样式适合打印
      htmlContainer.style.pageBreakInside = 'avoid';
      htmlContainer.style.marginBottom = '20px';
      htmlContainer.style.overflow = 'visible';
      htmlContainer.style.width = '100%';
      htmlContainer.style.height = 'auto';
      htmlContainer.style.minHeight = '400px';
      
      console.log(`📦 优化图表容器 ${index + 1} 样式完成`);
    });

    // 优化卡片布局
    const cards = element.querySelectorAll('.MuiCard-root');
    cards.forEach((card, index) => {
      const htmlCard = card as HTMLElement;
      htmlCard.style.pageBreakInside = 'avoid';
      htmlCard.style.marginBottom = '16px';
      htmlCard.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      htmlCard.style.border = '1px solid #e2e8f0';
      console.log(`🃏 优化卡片 ${index + 1} 样式完成`);
    });

    // 设置容器样式
    element.style.width = '100%';
    element.style.maxWidth = 'none';
    element.style.padding = '20px';
    element.style.backgroundColor = 'white';
    
    console.log('🎨 DOM优化完成');
  }

  // 等待图表渲染完成
  private static async waitForChartsToRender(): Promise<void> {
    return new Promise((resolve) => {
      // 首先等待基础渲染
      setTimeout(() => {
        console.log('📊 第一阶段: 基础渲染等待完成...');
        
        // 检查图表是否已经渲染
        const checkChartsReady = () => {
          const chartContainers = document.querySelectorAll('.echarts-for-react, [data-echarts-instance-index]');
          const canvasElements = document.querySelectorAll('canvas[data-zr-dom-id]');
          
          console.log(`🔍 检测到 ${chartContainers.length} 个图表容器，${canvasElements.length} 个Canvas元素`);
          
          // 检查Canvas是否有实际内容（非空白）
          let renderedCanvasCount = 0;
          canvasElements.forEach((canvas) => {
            const htmlCanvas = canvas as HTMLCanvasElement;
            try {
              // 尝试获取Canvas内容，如果有内容说明已渲染
              const imageData = htmlCanvas.getContext('2d')?.getImageData(0, 0, 1, 1);
              if (imageData && imageData.data.some(value => value !== 0)) {
                renderedCanvasCount++;
              }
            } catch (error) {
              // 如果无法访问Canvas内容，认为可能已渲染
              renderedCanvasCount++;
            }
          });
          
          console.log(`📈 已渲染的Canvas: ${renderedCanvasCount}/${canvasElements.length}`);
          return renderedCanvasCount > 0 || canvasElements.length === 0;
        };
        
        // 如果图表已准备好，再等待1秒确保完全渲染
        if (checkChartsReady()) {
          console.log('✅ 图表检测完成，等待最终渲染...');
          setTimeout(() => {
            console.log('🎨 图表渲染等待结束');
            resolve();
          }, 2000); // 额外等待2秒确保完全渲染
        } else {
          // 如果图表还没准备好，再等待更长时间
          console.log('⏳ 图表尚未完全渲染，继续等待...');
          setTimeout(() => {
            console.log('🎨 图表最终渲染等待结束');
            resolve();
          }, 4000); // 再等待4秒
        }
      }, 3000); // 初始等待3秒
    });
  }

  // 生成单个维度的PDF
  public static async generateSingleDimensionPDF(
    dimension: PrintDimension,
    onDimensionChange: (dimension: DateTimeType) => Promise<void>
  ): Promise<void> {
    try {
      console.log(`📄 开始生成${this.dimensionConfig[dimension].label}报告...`);

      // 如果不是全部维度，先切换到对应维度
      if (dimension !== 'all') {
        await onDimensionChange(this.dimensionConfig[dimension].dateTimeType);
        // 等待数据加载和图表渲染完成
        console.log('⏳ 等待数据加载...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // 增加到5秒
        console.log('⏳ 等待图表渲染...');
        await this.waitForChartsToRender();
      }

      // 准备打印内容
      const printContent = await this.preparePageForPrint();

      // 如果不是全部维度，添加分隔页
      if (dimension !== 'all') {
        const separatorPage = this.createSeparatorPage(dimension);
        printContent.insertBefore(separatorPage, printContent.firstChild?.nextSibling || null);
      }

      // 配置PDF选项 - 优化Canvas处理
      const options = {
        margin: 0.5,
        filename: `JIRA数据分析报告-${this.dimensionConfig[dimension].label}-${new Date().toLocaleDateString('zh-CN')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 1.5, // 适中的缩放比例，避免太大导致问题
          useCORS: true, 
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false, // 关闭日志避免干扰
          width: 1200, // 固定宽度
          height: 800, // 固定高度
          scrollX: 0,
          scrollY: 0,
          foreignObjectRendering: false, // 禁用SVG渲染，提高兼容性
          removeContainer: true,
          imageTimeout: 15000, // 15秒超时
          onclone: (clonedDoc: Document) => {
            // 在克隆的文档中进一步优化
            console.log('🔄 html2canvas克隆文档，进行最终优化...');
            
            // 确保所有图片都已加载
            const images = clonedDoc.querySelectorAll('img[data-original-canvas="true"]');
            console.log(`📸 克隆文档中找到 ${images.length} 个转换后的图片`);
            
            images.forEach((img, index) => {
              const htmlImg = img as HTMLImageElement;
              htmlImg.style.maxWidth = '100%';
              htmlImg.style.height = 'auto';
              htmlImg.style.display = 'block';
              console.log(`🖼️ 优化图片 ${index + 1}: ${htmlImg.getAttribute('data-canvas-size')}`);
            });
          }
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'landscape',
          compress: true // 启用压缩
        },
        pagebreak: { 
          mode: 'avoid-all', 
          before: '.page-break-before', 
          after: '.page-break-after' 
        }
      };

      // 生成PDF
      await html2pdf().set(options).from(printContent).save();
      
      console.log(`✅ ${this.dimensionConfig[dimension].label}报告生成完成`);
    } catch (error) {
      console.error(`❌ 生成${this.dimensionConfig[dimension].label}报告失败:`, error);
      throw error;
    }
  }

  // 生成全部维度的PDF
  public static async generateAllDimensionsPDF(
    onDimensionChange: (dimension: DateTimeType) => Promise<void>
  ): Promise<void> {
    try {
      console.log('📄 开始生成全部维度报告...');

      const allContent = document.createElement('div');
      allContent.style.backgroundColor = 'white';

      // 添加标题页
      const titlePage = this.createTitlePage();
      allContent.appendChild(titlePage);

      // 遍历所有维度（除了'all'）
      const dimensions: PrintDimension[] = ['created', 'resolutiondate', 'duedate', 'actualreleasedate'];
      
      for (let i = 0; i < dimensions.length; i++) {
        const dimension = dimensions[i];
        console.log(`📊 正在处理${this.dimensionConfig[dimension].label}...`);

        // 切换到对应维度
        await onDimensionChange(this.dimensionConfig[dimension].dateTimeType);
        
        // 等待数据加载和图表渲染
        console.log(`⏳ ${this.dimensionConfig[dimension].label} - 等待数据加载...`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // 增加到5秒
        console.log(`⏳ ${this.dimensionConfig[dimension].label} - 等待图表渲染...`);
        await this.waitForChartsToRender();

        // 添加分隔页
        const separatorPage = this.createSeparatorPage(dimension);
        allContent.appendChild(separatorPage);

        // 获取当前页面内容
        const mainContent = document.querySelector('[data-print-content]') || 
                           document.querySelector('main') || 
                           document.querySelector('.MuiContainer-root');
        
        if (mainContent) {
          const clonedContent = mainContent.cloneNode(true) as HTMLElement;
          this.optimizeForPrint(clonedContent);
          
          // 为每个维度的内容添加容器
          const dimensionContainer = document.createElement('div');
          dimensionContainer.style.cssText = 'page-break-before: always;';
          dimensionContainer.appendChild(clonedContent);
          
          allContent.appendChild(dimensionContainer);
        }
      }

      // 配置PDF选项
      const options = {
        margin: 0.5,
        filename: `JIRA数据分析报告-全部维度-${new Date().toLocaleDateString('zh-CN')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 1.5,
          useCORS: true, 
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 1200,
          height: 800,
          scrollX: 0,
          scrollY: 0,
          foreignObjectRendering: false,
          removeContainer: true,
          imageTimeout: 15000,
          onclone: (clonedDoc: Document) => {
            console.log('🔄 全部维度报告 - html2canvas克隆文档优化...');
            const images = clonedDoc.querySelectorAll('img[data-original-canvas="true"]');
            console.log(`📸 全部维度报告 - 克隆文档中找到 ${images.length} 个转换后的图片`);
            images.forEach((img, index) => {
              const htmlImg = img as HTMLImageElement;
              htmlImg.style.maxWidth = '100%';
              htmlImg.style.height = 'auto';
              htmlImg.style.display = 'block';
            });
          }
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'landscape',
          compress: true
        },
        pagebreak: { 
          mode: 'avoid-all', 
          before: '.page-break-before', 
          after: '.page-break-after' 
        }
      };

      // 生成PDF
      await html2pdf().set(options).from(allContent).save();
      
      console.log('✅ 全部维度报告生成完成');
    } catch (error) {
      console.error('❌ 生成全部维度报告失败:', error);
      throw error;
    }
  }

  // 主要的打印方法
  public static async printReport(
    dimension: PrintDimension,
    onDimensionChange: (dimension: DateTimeType) => Promise<void>
  ): Promise<void> {
    if (dimension === 'all') {
      await this.generateAllDimensionsPDF(onDimensionChange);
    } else {
      await this.generateSingleDimensionPDF(dimension, onDimensionChange);
    }
  }
}

export default PrintService; 