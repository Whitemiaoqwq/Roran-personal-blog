const fs = require('fs');
const path = require('path');

// 设置文件夹路径
const PASSAGE_DIR = path.join(__dirname, 'static', 'passage');
const MANIFEST_PATH = path.join(PASSAGE_DIR, 'manifest.json');

// 读取passage目录下的所有文件
fs.readdir(PASSAGE_DIR, (err, files) => {
    if (err) {
        console.error('无法读取passage目录:', err);
        return;
    }
    
    // 过滤出.md文件并排序
    const mdFiles = files
        .filter(file => file.endsWith('.md'))
        .sort((a, b) => {
            // 尝试按数字顺序排序文件（例如chapter1.md, chapter2.md）
            const numA = parseInt(a.match(/\d+/)?.[0] || 0);
            const numB = parseInt(b.match(/\d+/)?.[0] || 0);
            return numA - numB;
        });
    
    // 创建章节数据
    const chapters = mdFiles.map((file, index) => {
        // 从文件名生成标题
        let title = file.replace('.md', '');
        
        // 尝试格式化标题，例如将chapter1转换为"第一章："
        const chapterNumber = title.match(/\d+/);
        if (chapterNumber) {
            // 提取数字部分后面的文本作为章节标题
            const titlePart = title.replace(/^chapter\d+|\.|-|_/gi, ' ').trim();
            title = `第${chapterNumber[0]}章：${titlePart || '未命名章节'}`;
        }
        
        return {
            id: index + 1,
            title: title,
            file: file
        };
    });
    
    // 将章节数据写入manifest.json文件
    fs.writeFile(
        MANIFEST_PATH,
        JSON.stringify(chapters, null, 2), // 使用2个空格进行缩进，使JSON更易读
        (err) => {
            if (err) {
                console.error('无法写入manifest.json:', err);
                return;
            }
            
            console.log(`成功生成manifest.json文件！`);
            console.log(`共发现${chapters.length}个章节文件。`);
            chapters.forEach(chapter => {
                console.log(`- ${chapter.id}. ${chapter.title} (${chapter.file})`);
            });
        }
    );
});