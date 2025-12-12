import type { Extracted } from "@/lib/types"; 
 
 // 简单分词（中/英文）并去重 
 function tokenize(text: string): string[] { 
   const cleaned = text 
     .replace(/[，。！？、\n\r\t]+/g, " ") 
     .replace(/[^\p{L}\p{N}\s]/gu, " ") 
     .toLowerCase(); 
   const parts = cleaned.split(/\s+/).filter(Boolean); 
   return Array.from(new Set(parts)); 
 } 
 
 type DictEntryLite = { 
   id?: string; 
   dream_symbol: string; 
   category?: string; 
   possible_emotions?: string[]; 
   keywords?: string[]; // 可选字段，词典若无可用 dream_symbol 进行匹配 
   questions_to_user?: string[]; 
   comforting_words?: string[]; 
   small_steps?: string[]; 
 }; 
 
 export async function parseDream(text: string): Promise<{ extracted: Extracted; summary: string; hints: { questions: string[]; comforting: string[]; steps: string[] } }> { 
   // safety 
   const tokens = tokenize(text); 
   let dict: DictEntryLite[] = []; 
   try { 
     // dynamic import so it's safe in SSR (only loads in client) 
    // eslint-disable-next-line @typescript-eslint/no-var-requires 
    const mod = await import("../data/dream-dictionary.json"); 
    const raw = Array.isArray(mod.default) ? mod.default : mod;
    dict = raw.map((it: any) => ({
       dream_symbol: it.keyword,
       id: it.id,
       category: it.category,
       interpretation: it.interpretation,
       keywords: [it.keyword],
    })); 
   } catch (e) { 
     // if dictionary missing, fallback to a few built-in patterns 
     dict = [ 
       { dream_symbol: "考试", possible_emotions: ["anxiety", "stress"], keywords: ["exam", "考试","成绩","测验"], questions_to_user: ["最近有让你担心的评估或任务吗？"], comforting_words: ["很多人都会有这种紧张，慢慢来。"], small_steps: ["拆小步，先做第一件事。"] }, 
       { dream_symbol: "追赶", possible_emotions: ["fear", "anxiety"], keywords: ["chase","追赶","被追"], questions_to_user: ["有没有什么你一直在回避的事？"], comforting_words: ["你不是在逃，你是在自我保护。"], small_steps: ["先写下最小的一步。"] } 
     ]; 
   } 
 
   // match entries by dream_symbol or keywords (simple contains) 
   const matched: DictEntryLite[] = []; 
   for (const entry of dict) { 
     const name = (entry.dream_symbol || "").toLowerCase(); 
     const entryKeywords = (entry.keywords || []).map(k => k.toLowerCase()); 
     // if any token is substring of dream_symbol or present in keywords 
     for (const t of tokens) { 
       if (name.includes(t) || entryKeywords.some(k => k.includes(t)) || t.includes(name)) { 
         matched.push(entry); 
         break; 
       } 
     } 
   } 
 
   // build extracted fields (very simple heuristics) 
   const scenes: string[] = []; 
   const people: string[] = []; 
   const actions: string[] = []; 
   const symbols: string[] = []; 
   const keywordsArr: string[] = []; 
 
   // heuristics: tokens that match dict.dream_symbol -> symbols 
   for (const entry of matched) { 
     if (entry.dream_symbol) symbols.push(entry.dream_symbol); 
     if (entry.category) scenes.push(entry.category); 
     if (entry.keywords) keywordsArr.push(...entry.keywords); 
   } 
 
   // fallback: try some simple rules 
   for (const t of tokens) { 
     if (["我","你","他","她","父母","妈妈","爸爸","朋友","前任"].includes(t)) { 
       people.push(t); 
     } else if (["追赶","追","跑","飞","坠落","跳"].some(a => t.includes(a))) { 
       actions.push(t); 
     } else if (["海","山","学校","家","医院"].some(s => t.includes(s))) { 
       scenes.push(t); 
     } else { 
       // collect as keyword 
       keywordsArr.push(t); 
     } 
   } 
 
   // dedupe 
   const dedupe = (arr: string[]) => Array.from(new Set(arr)).filter(Boolean); 
 
   const possibleEmotions: string[] = []; 
   for (const m of matched) { 
     if (m.possible_emotions) possibleEmotions.push(...m.possible_emotions); 
   } 
 
   const emotions = dedupe(possibleEmotions).slice(0, 4) as Extracted["emotions"]; 
 
   const extracted: Extracted = { 
     scenes: dedupe(scenes), 
     people: dedupe(people), 
     actions: dedupe(actions), 
     symbols: dedupe(symbols), 
     emotions: emotions.length ? emotions as any : (["neutral"] as any), 
     keywords: dedupe(keywordsArr).slice(0, 10), 
   }; 
 
   // build a gentle summary using D-TIME template 
  const summaryParts: string[] = []; 
  if (extracted.symbols?.length) { 
    summaryParts.push(`我在你的梦里看到了 ${extracted.symbols.join("、")}，这些通常和内心的某些感觉有关。`); 
  } else if (extracted.actions?.length) { 
    summaryParts.push(`你梦到的动作像是 ${extracted.actions.join("、")}，可能是在表达某种情绪动态。`); 
  } else { 
    summaryParts.push("谢谢你愿意分享这个梦，我会尽量温柔地解读它。"); 
  } 
 
   if (extracted.emotions && extracted.emotions.length) { 
     summaryParts.push(`我读到的情绪线索有：${extracted.emotions.join("、")}。`); 
   } 
 
   summaryParts.push("如果你愿意，可以尝试回答下面一个问题，或把梦写得再具体一点，我们可以一起慢慢理清。"); 
 
   // collect hints for UI (questions/comfort/steps) 
   const questions: string[] = []; 
   const comforting: string[] = []; 
   const steps: string[] = []; 
   for (const m of matched) { 
     if (m.questions_to_user) questions.push(...m.questions_to_user); 
     if (m.comforting_words) comforting.push(...m.comforting_words); 
     if (m.small_steps) steps.push(...m.small_steps); 
   } 
 
   // fallback defaults 
   if (!questions.length) questions.push("这个梦里最让你在意的部分是什么？"); 
   if (!comforting.length) comforting.push("你的感受是真实的，允许自己慢慢看见它们。"); 
   if (!steps.length) steps.push("试着写下今天让你最紧张的一件小事，做第一小步。"); 
 
   const summary = summaryParts.join(" "); 
 
   return { 
     extracted, 
     summary, 
     hints: { 
       questions: dedupe(questions).slice(0, 3), 
       comforting: dedupe(comforting).slice(0, 3), 
       steps: dedupe(steps).slice(0, 3) 
     } 
   }; 
 }