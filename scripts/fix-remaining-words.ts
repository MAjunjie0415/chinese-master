/**
 * 手动修复剩余的单词翻译
 * 这些单词因为网络问题没有被API修复
 */

import 'dotenv/config';
import { client } from '../lib/drizzle';

// 手动翻译列表
const translations: Record<string, string> = {
    '性格': 'personality',
    '预习': 'preview',
    '阅读': 'reading',
    '暂时': 'temporary',
    '正常': 'normal',
    '证明': 'prove',
    '著名': 'famous',
    '自然': 'nature',
    '并且': 'and',
    '不管': 'regardless',
    '不仅': 'not only',
    '厕所': 'toilet',
    '呆': 'stay',
    '拍': 'pat',
    '干脆': 'simply',
    '糊涂': 'confused',
    '委屈': 'wronged',
    '影子': 'shadow',
    '爱惜': 'cherish',
    '爱心': 'love',
    '不安': 'uneasy',
    '刺激': 'stimulate',
    '措施': 'measure',
    '地区': 'region',
    '对方': 'opponent',
    '冠军': 'champion',
    '过期': 'expired',
    '健身': 'fitness',
    '据说': 'reportedly',
    '客观': 'objective',
    '辣椒': 'chili',
    '乐观': 'optimistic',
    '利息': 'interest',
    '列车': 'train',
    '录音': 'recording',
    '蜜蜂': 'bee',
    '面积': 'area',
    '偏偏': 'unfortunately',
    '倾听': 'listen',
    '清晰': 'clear',
    '哄': 'coax',
    '奔驰': 'gallop',
    '恶劣': 'bad',
    '奴隶': 'slave',
    '排斥': 'exclude',
    '排放': 'emission',
    '排练': 'rehearse',
    '勉强': 'reluctant',
    '细胞': 'cell',
    '细菌': 'bacteria',
    '血压': 'blood pressure',
    '亚军': 'runner-up',
    '验收': 'acceptance',
    '应邀': 'by invitation',
    '预期': 'expect',
    '预先': 'beforehand',
    '滞留': 'stranded',
    '擅自': 'without permission',
    '赞叹': 'praise',
    '赞助': 'sponsor',
    '赠送': 'gift',
    '诈骗': 'fraud',
    '债券': 'bond',
    '占据': 'occupy',
    '战斗': 'fight',
    '战略': 'strategy',
    '战术': 'tactics',
    '战役': 'battle',
    '障碍': 'obstacle',
    '照样': 'as usual',
    '照耀': 'shine',
    '殖民地': 'colony',
    '博览会': 'expo',
    '繁体字': 'traditional Chinese',
    '不像话': 'outrageous',
    '国务院': 'State Council',
    '打官司': 'sue',
    '里程碑': 'milestone',
    '指南针': 'compass',
    '水龙头': 'faucet',
    '羽绒服': 'down jacket',
    '简体字': 'simplified Chinese',
    '董事长': 'chairman',
    '领事馆': 'consulate',
    '立交桥': 'overpass',
    '共和国': 'republic',
    '不得已': 'have no choice',
    '蛋白质': 'protein',
    '不由得': 'cannot help',
    '不敢当': 'dare not accept',
    '涮火锅': 'hot pot',
};

async function fixManually() {
    console.log('🔧 Manually fixing remaining words...\n');

    let fixed = 0;
    let notFound = 0;

    for (const [chinese, english] of Object.entries(translations)) {
        try {
            const result = await client`
        UPDATE words 
        SET english = ${english} 
        WHERE chinese = ${chinese} AND english ~ '[\u4e00-\u9fff]'
      `;
            if (result.count > 0) {
                console.log('✓', chinese, '→', english);
                fixed++;
            } else {
                notFound++;
            }
        } catch (e) {
            console.error('✗', chinese, e);
        }
    }

    console.log('\n────────────────────────────────────────────────────────────');
    console.log(`\n✅ Fixed: ${fixed} words`);
    console.log(`⚡ Already fixed or not found: ${notFound} words`);

    // Check remaining count
    const remaining = await client`
    SELECT COUNT(*) as count FROM words WHERE english ~ '[\u4e00-\u9fff]'
  `;
    console.log(`\n📊 Remaining words with Chinese in english field: ${remaining[0]?.count}`);

    await client.end();
}

fixManually().catch(console.error);
