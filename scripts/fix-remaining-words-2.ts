/**
 * 手动修复剩余的单词翻译 (第二批)
 */

import 'dotenv/config';
import { client } from '../lib/drizzle';

const translations: Record<string, string> = {
    '居住': 'live',
    '军队': 'army',
    '开阔': 'broad',
    '开辟': 'open up',
    '开拓': 'develop',
    '刊物': 'publication',
    '勘探': 'explore',
    '科目': 'subject',
    '空洞': 'empty',
    '枯燥': 'boring',
    '哭泣': 'cry',
    '亏待': 'mistreat',
    '抛弃': 'abandon',
    '烹饪': 'cook',
    '批判': 'criticize',
    '偏见': 'prejudice',
    '偏僻': 'remote',
    '拼命': 'desperately',
    '期望': 'expect',
    '期限': 'deadline',
    '欺骗': 'deceive',
    '迁就': 'accommodate',
    '牵制': 'restrain',
    '谦逊': 'modest',
    '钦佩': 'admire',
    '侵犯': 'violate',
    '侵略': 'invade',
    '亲密': 'intimate',
    '亲热': 'affectionate',
    '倾向': 'tendency',
    '清澈': 'clear',
    '区域': 'area',
    '圈套': 'trap',
    '缺陷': 'defect',
    '山脉': 'mountain range',
    '申报': 'declare',
    '绅士': 'gentleman',
    '深奥': 'profound',
    '生态': 'ecology',
    '生物': 'organism',
    '家伙': 'guy',
    '将就': 'make do',
    '宽敞': 'spacious',
    '啰唆': 'nagging',
    '欺负': 'bully',
    '书记': 'secretary',
    '疏忽': 'neglect',
    '斯文': 'refined',
    '踏实': 'steady',
    '挑剔': 'picky',
    '衣裳': 'clothes',
    '冤枉': 'wrongly accuse',
    '调和': 'reconcile',
    '调节': 'regulate',
    '停泊': 'dock',
    '投降': 'surrender',
    '团结': 'unite',
    '团圆': 'reunite',
    '顽强': 'tenacious',
    '为难': 'embarrass',
    '唯独': 'only',
    '维持': 'maintain',
    '文凭': 'diploma',
    '无偿': 'free',
    '习俗': 'custom',
    '嫌疑': 'suspicion',
    '协调': 'coordinate',
    '巡逻': 'patrol',
    '毒品': 'drugs',
    '而已': 'only',
    '防守': 'defend',
    '防止': 'prevent',
    '俘虏': 'prisoner',
    '毫米': 'millimeter',
    '合伙': 'partner',
    '和蔼': 'kind',
    '和解': 'reconcile',
    '宏伟': 'magnificent',
    '洪水': 'flood',
    '及早': 'early',
    '截止': 'deadline',
    '觉醒': 'awaken',
    '连锁': 'chain',
    '联想': 'associate',
    '灵感': 'inspiration',
    '灵敏': 'sensitive',
    '聋哑': 'deaf-mute',
    '弥补': 'make up',
    '磁带': 'tape',
    '答辩': 'defend',
    '答复': 'reply',
    '得力': 'capable',
    '得罪': 'offend',
    '敌视': 'hostile',
    '额外': 'extra',
    '凡是': 'all',
    '防御': 'defense',
    '防治': 'prevent',
    '肥沃': 'fertile',
    '坟墓': 'tomb',
    '服气': 'convinced',
    '符号': 'symbol',
    '幅度': 'extent',
    '辐射': 'radiation',
    '福利': 'welfare',
    '福气': 'blessing',
    '革命': 'revolution',
    '格式': 'format',
    '回顾': 'review',
    '活力': 'vitality',
    '极限': 'limit',
    '即便': 'even if',
    '急剧': 'rapidly',
    '急切': 'eager',
    '急躁': 'impatient',
    '辽阔': 'vast',
    '伶俐': 'clever',
    '留恋': 'reluctant',
    '流浪': 'wander',
    '流露': 'reveal',
    '留念': 'souvenir',
    '隆重': 'grand',
    '炉灶': 'stove',
    '轮廓': 'outline',
    '麻痹': 'paralysis',
    '麻木': 'numb',
    '麻醉': 'anesthesia',
    '埋没': 'bury',
    '埋葬': 'bury',
    '埋怨': 'complain',
    '忙碌': 'busy',
    '盲目': 'blind',
    '媒介': 'medium',
    '弥漫': 'spread',
    '迷惑': 'confused',
    '农历': 'lunar calendar',
    '浓厚': 'strong',
};

async function fixManually() {
    console.log('🔧 Fixing remaining words (batch 2)...\n');

    let fixed = 0;

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
            }
        } catch (e) {
            console.error('✗', chinese, e);
        }
    }

    console.log('\n────────────────────────────────────────────────────────────');
    console.log(`\n✅ Fixed: ${fixed} words`);

    const remaining = await client`
    SELECT COUNT(*) as count FROM words WHERE english ~ '[\u4e00-\u9fff]'
  `;
    console.log(`\n📊 Remaining words with Chinese in english field: ${remaining[0]?.count}`);

    await client.end();
}

fixManually().catch(console.error);
