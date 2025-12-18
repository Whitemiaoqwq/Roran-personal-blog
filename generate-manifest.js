const fs = require('fs');
const path = require('path');

// 设置文件夹路径
const PASSAGE_DIR = path.join(__dirname, 'static', 'passage');
const NOTES_DIR = path.join(__dirname, 'static', 'notes');

// 生成manifest.json的函数
function generateManifest(dirPath, type) {
    const MANIFEST_PATH = path.join(dirPath, 'manifest.json');
    
    // 读取目录下的所有文件
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error(`无法读取${type}目录:`, err);
            return;
        }
        
        // 过滤出.md文件并排序
        const mdFiles = files
            .filter(file => file.endsWith('.md'))
            .sort((a, b) => {
                // 尝试按数字顺序排序文件（例如chapter1.md, chapter2.md或note1.md, note2.md）
                const numA = parseInt(a.match(/\d+/)?.[0] || 0);
                const numB = parseInt(b.match(/\d+/)?.[0] || 0);
                return numA - numB;
            });
        
        // 创建数据
        const items = mdFiles.map((file, index) => {
            // 从文件名生成标题
            let title = file.replace('.md', '');
            
            // 根据类型格式化标题
            const itemNumber = title.match(/\d+/);
            if (itemNumber) {
                if (type === 'passage') {
                    // 提取数字部分后面的文本作为章节标题
                    const titlePart = title.replace(/^chapter\d+|\.|-|_/gi, ' ').trim();
                    title = `第${itemNumber[0]}章：${titlePart || '未命名章节'}`;
                } else if (type === 'notes') {
                    // 提取数字部分后面的文本作为笔记标题
                    const titlePart = title.replace(/^note\d+|\.|-|_/gi, ' ').trim();
                    title = titlePart || `未命名笔记${itemNumber[0]}`;
                }
            }
            
            // 对于笔记，添加date字段（这里简单使用当前日期，实际项目中可以从文件内容或文件名提取）
            const itemData = {
                id: index + 1,
                title: title,
                file: file
            };
            
            if (type === 'notes') {
                itemData.date = '2023年9月1日'; // 默认日期，实际项目中可以改进
            }
            
            return itemData;
        });
        
        // 将数据写入manifest.json文件
        fs.writeFile(
            MANIFEST_PATH,
            JSON.stringify(items, null, 2), // 使用2个空格进行缩进，使JSON更易读
            (err) => {
                if (err) {
                    console.error(`无法写入${type}的manifest.json:`, err);
                    return;
                }
                
                console.log(`成功生成${type}的manifest.json文件！`);
                console.log(`共发现${items.length}个${type === 'passage' ? '章节' : '笔记'}文件。`);
                items.forEach(item => {
                    console.log(`- ${item.id}. ${item.title} (${item.file})`);
                });
            }
        );
    });
}

// 生成passage和notes的manifest.json
generateManifest(PASSAGE_DIR, 'passage');
generateManifest(NOTES_DIR, 'notes');
