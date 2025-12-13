"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import BackButton from '@/components/BackButton';
import { DREAM_DICTIONARY, DictionaryItem } from '@/data/dictionary';

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generatedTerm, setGeneratedTerm] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const filteredEntries = DREAM_DICTIONARY.filter(entry => {
    const q = searchTerm.trim();
    if (!q) return true;
    return entry.term.includes(q) || entry.meaning.includes(q) || entry.short.includes(q);
  });

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const suggestEmotions = (entry: DictionaryItem): string[] => {
    const byTerm: Record<string, string[]> = {
      "飞翔": ["自由", "解脱", "兴奋"],
      "坠落": ["失控", "不安", "焦虑"],
      "被追赶": ["紧张", "压力", "回避"],
      "蛇": ["警惕", "好奇", "重生"],
      "水": ["平静", "混乱", "压抑"],
      "考试": ["担忧", "自我要求", "紧张"],
      "迷路": ["迷茫", "犹豫", "孤独"],
      "死亡": ["变化", "告别", "新生"],
      "镜子": ["自我反思", "不确定", "敏感"],
      "电梯": ["波动", "期待", "不稳"],
      "掉牙": ["焦虑", "失去", "脆弱"],
      "裸体": ["羞怯", "坦诚", "不安"],
    };
    if (byTerm[entry.term]) return byTerm[entry.term];
    const byCat: Record<string, string[]> = {
      "行为": ["行动", "渴望", "紧张"],
      "动物": ["本能", "直觉", "警惕"],
      "自然": ["宁静", "波动", "能量"],
      "场景": ["压力", "期待", "迷茫"],
      "身体": ["脆弱", "成长", "羞怯"],
      "物品": ["价值感", "控制", "反思"],
      "抽象": ["变化", "告别", "希望"],
    };
    return byCat[entry.category] || ["好奇", "不确定", "平静"];
  };

  const handleGenerate = async () => {
    const term = searchTerm.trim();
    if (!term) return;
    setGenerating(true);
    setGenError(null);
    setGeneratedTerm(term);
    try {
      const messages = [
        { role: "system" as const, content: "你是一位温柔的梦境陪伴者。请基于用户提供的梦境意象关键词生成一个临时理解，不下定论，语言克制。输出包含：1）可能的象征方向；2）情绪或近期状态的联想；3）一句温柔提醒。" },
        { role: "user" as const, content: `意象：${term}。请用中文、温柔的口吻，结构清晰。` }
      ];
      const res = await fetch('/api/kimi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      const data = await res.json();
      if (!res.ok) {
        setGenError(data?.error || `接口错误：${res.status}`);
        setGeneratedContent(null);
      } else {
        setGeneratedContent(String(data?.content || ''));
      }
    } catch (e: any) {
      setGenError(e?.message || '网络似乎出了问题');
      setGeneratedContent(null);
    } finally {
      setGenerating(false);
    }
  };

  const clearGenerated = () => {
    setGeneratedContent(null);
    setGeneratedTerm(null);
    setGenError(null);
  };

  return (
    <div className={styles.container}>
      <BackButton />
      
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Dream Dictionary</h1>
        <p className={styles.intro}>这些意象的解释并不唯一，也许能为你提供温柔的参考。</p>
        
        <div className={styles.searchBarWrapper}>
          <input 
            type="text" 
            placeholder="输入梦境意象关键词（如：蛇、坠落、海）" 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>

      <div className={styles.gridSection}>
        {filteredEntries.map(entry => (
          <div 
            key={entry.id} 
            className={`${styles.card} ${expandedId === entry.id ? styles.expanded : ''}`}
            onClick={() => toggleExpand(entry.id)}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{entry.term}</h3>
              <span className={styles.cardCategory}>{entry.category}</span>
            </div>
            
            <div className={styles.cardContent}>
              <p className={styles.shortDesc}>轻轻展开，看看它可能代表什么</p>
              
              <div className={`${styles.fullMeaning} ${expandedId === entry.id ? styles.show : ''}`}>
                <div className={styles.divider}></div>
                <div className={styles.sectionTitle}>常见象征</div>
                <p>{entry.meaning}</p>
                <div className={styles.sectionTitle}>可能的情绪关联</div>
                <ul className={styles.hintList}>
                  {suggestEmotions(entry).map(e => (
                    <li key={e}>也许是：{e}</li>
                  ))}
                </ul>
                <div className={styles.gentleNote}>这些解释不是定论，请以你真实的感受为准。</div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.expandHint}>
                {expandedId === entry.id ? '收起' : '展开解释'}
              </span>
              <div className={styles.iconWrapper}>
                {entry.icon}
              </div>
            </div>
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <div className={styles.generateCard}>
            <div className={styles.genHeader}>
              <div className={styles.genTitle}>意象：{searchTerm.trim() || '（未输入）'}</div>
              {generatedContent && (
                <button className={styles.genClose} onClick={clearGenerated}>收起</button>
              )}
            </div>
            {!generatedContent && (
              <p className={styles.genHint}>这个意象没有固定的解释，它的意义往往和你的感受有关。</p>
            )}
            {genError && <div className={styles.genError}>{genError}</div>}
            {!generatedContent && (
              <div className={styles.genActions}>
                <button className={styles.genBtn} onClick={handleGenerate} disabled={generating || !searchTerm.trim()}>
                  {generating ? '生成中...' : '帮我理解这个意象'}
                </button>
              </div>
            )}
            {generatedContent && (
              <div className={styles.genContent}>
                <div className={styles.sectionTitle}>临时理解</div>
                <div className={styles.genText}>{generatedContent}</div>
                <div className={styles.gentleNote}>以上仅供参考，不作为权威解释，你的真实感受更重要。</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
