#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
词库清洁脚本
功能：清洁商务汉语和HSK词库CSV文件，去重、补全缺失值、添加拼音声调
"""

import os
import pandas as pd
from pypinyin import pinyin, Style


def add_tone_to_pinyin(hanzi, original_pinyin):
    """
    补全拼音声调
    :param hanzi: 汉字
    :param original_pinyin: 原始拼音（可能无声调）
    :return: 带声调的拼音
    """
    # 检查是否已有声调标记
    tone_marks = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛńň'
    has_tone_mark = any(char in tone_marks for char in str(original_pinyin))
    has_number = any(char.isdigit() for char in str(original_pinyin))
    
    # 如果已有声调标记，直接返回
    if has_tone_mark or has_number:
        return original_pinyin
    
    # 使用pypinyin生成带声调的拼音
    try:
        # TONE格式：使用声调符号（如nǐ）
        pinyin_with_tone = pinyin(hanzi, style=Style.TONE, heteronym=False)
        # 提取拼音（返回格式为[['nǐ']]）
        result = ''.join([p[0] for p in pinyin_with_tone])
        # 如果pypinyin返回的仍然无声调（轻声字），添加轻声标记
        if result and not any(char in tone_marks for char in result):
            # 对于轻声字（如de、le、ma），pypinyin会返回原样
            # 在原拼音后添加5表示轻声
            result = original_pinyin + '5'
        return result if result else original_pinyin
    except Exception:
        return original_pinyin


def clean_business_words(input_path, output_path):
    """
    清洁商务汉语词库
    :param input_path: 输入文件路径
    :param output_path: 输出文件路径
    :return: (清洁后行数, 重复行数)
    """
    print(f"正在处理商务汉语词库：{input_path}")
    
    # 读取CSV文件
    df = pd.read_csv(input_path, encoding='utf-8')
    original_count = len(df)
    
    # 去重：按"汉字+拼音"组合去重
    df = df.drop_duplicates(subset=['汉字', '拼音'], keep='first')
    duplicate_count = original_count - len(df)
    
    # 补全缺失值
    df['英文释义'] = df['英文释义'].fillna('暂无')
    df['场景标签'] = df['场景标签'].fillna('通用')
    df['例句'] = df['例句'].fillna('')
    
    # 补全拼音声调
    for idx, row in df.iterrows():
        df.at[idx, '拼音'] = add_tone_to_pinyin(row['汉字'], row['拼音'])
    
    # 添加category字段
    df['category'] = 'business'
    
    # 保存清洁后的文件
    df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"商务汉语词库已保存至：{output_path}")
    
    return len(df), duplicate_count


def clean_hsk_words(input_path, output_path):
    """
    清洁HSK词库
    :param input_path: 输入文件路径
    :param output_path: 输出文件路径
    :return: (清洁后行数, 重复行数)
    """
    print(f"正在处理HSK词库：{input_path}")
    
    # 读取CSV文件
    df = pd.read_csv(input_path, encoding='utf-8')
    original_count = len(df)
    
    # 去重：按"汉字+拼音"组合去重
    df = df.drop_duplicates(subset=['汉字', '拼音'], keep='first')
    duplicate_count = original_count - len(df)
    
    # 补全缺失值
    df['英文释义'] = df['英文释义'].fillna('暂无')
    df['词频'] = df['词频'].fillna(3)
    df['等级'] = df['等级'].fillna(1).astype(int)
    
    # 补全拼音声调
    for idx, row in df.iterrows():
        df.at[idx, '拼音'] = add_tone_to_pinyin(row['汉字'], row['拼音'])
    
    # 添加category字段：hsk1, hsk2, ..., hsk6
    df['category'] = df['等级'].apply(lambda x: f'hsk{int(x)}')
    
    # 保存清洁后的文件
    df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"HSK词库已保存至：{output_path}")
    
    return len(df), duplicate_count


def main():
    """主函数：执行词库清洁流程"""
    # 定义文件路径（相对于项目根目录）
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    business_input = os.path.join(project_root, 'business_words.csv')
    business_output = os.path.join(project_root, 'business_words_clean.csv')
    
    hsk_input = os.path.join(project_root, 'hsk_words.csv')
    hsk_output = os.path.join(project_root, 'hsk_words_clean.csv')
    
    # 检查输入文件是否存在
    if not os.path.exists(business_input):
        print(f"错误：找不到商务汉语词库文件：{business_input}")
        return
    if not os.path.exists(hsk_input):
        print(f"错误：找不到HSK词库文件：{hsk_input}")
        return
    
    # 清洁商务汉语词库
    business_count, business_duplicates = clean_business_words(business_input, business_output)
    
    # 清洁HSK词库
    hsk_count, hsk_duplicates = clean_hsk_words(hsk_input, hsk_output)
    
    # 打印统计信息
    total_duplicates = business_duplicates + hsk_duplicates
    print("\n" + "="*50)
    print(f"词库清洁完成！商务汉语：{business_count}条，HSK词库：{hsk_count}条，跳过重复：{total_duplicates}条")
    print("="*50)


if __name__ == "__main__":
    main()

