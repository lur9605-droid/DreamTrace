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
    emotions: emotions.length > 0 ? emotions : ["neutral"],
    keywords: dedupe(keywordsArr).slice(0, 8),
    people: dedupe(people),
    actions: dedupe(actions),
    scenes: dedupe(scenes),
    symbols: dedupe(symbols),
  };

  // Generate a mock summary
  const summary = `你梦到了${(extracted.symbols && extracted.symbols.length > 0 ? extracted.symbols.join("、") : "一些特别的意象")}，这似乎与${(extracted.emotions && extracted.emotions.length > 0 ? extracted.emotions.join("或") : "某种内心的感受")}有关。${
    matched.length > 0 ? (matched[0] as any).interpretation || "" : "这是一个探索潜意识的好机会。"
  }`;

  // Hints
  const hints = {
    questions: matched.flatMap(m => m.questions_to_user || []).slice(0, 2),
    comforting: matched.flatMap(m => m.comforting_words || []).slice(0, 2),
    steps: matched.flatMap(m => m.small_steps || []).slice(0, 2)
  };

  if (hints.questions.length === 0) hints.questions.push("这个梦里有什么让你印象最深的地方吗？");
  if (hints.comforting.length === 0) hints.comforting.push("无论梦境如何，你的感受都是真实的，接纳它们就好。");
  if (hints.steps.length === 0) hints.steps.push("试着把这个梦记录下来，或者画一幅画。");

  return { extracted, summary, hints };
}

// --- Chat Logic ---

export type ChatContext = {
  stage: 'initial' | 'dream_collecting' | 'emotion_exploring' | 'deepening' | 'ready_for_analysis';
  dreamText: string;
  turnCount: number;
};

export type ChatResponse = {
  text: string;
  newContext: ChatContext;
  action: 'none' | 'show_analysis';
};

export function determineIntent(text: string): 'dream_desc' | 'emotion_expr' | 'hesitation' | 'anxious' | 'request_analysis' | 'other' {
  const t = text.toLowerCase();
  
  if (["不知道", "忘了", "不确定", "...", "也许", "记不清"].some(k => t.includes(k))) return 'hesitation';
  if (["害怕", "恐惧", "担心", "焦虑", "紧张", "不安", "吓人"].some(k => t.includes(k))) return 'anxious';
  if (["开心", "快乐", "平静", "舒服", "奇怪", "难过", "悲伤", "愤怒", "生气"].some(k => t.includes(k))) return 'emotion_expr';
  if (["分析", "意思", "解读", "结果", "为什么"].some(k => t.includes(k))) return 'request_analysis';
  if (t.length > 10 || ["梦", "看见", "走到", "飞", "掉"].some(k => t.includes(k))) return 'dream_desc';
  
  return 'other';
}

export async function chatWithAI(input: string, context: ChatContext): Promise<ChatResponse> {
  const intent = determineIntent(input);
  let nextContext = { ...context, turnCount: context.turnCount + 1 };
  let reply = "";
  let action: ChatResponse['action'] = 'none';

  // Always accumulate text if it looks like content
  if (intent === 'dream_desc' || intent === 'other') {
      nextContext.dreamText += " " + input;
  }

  // Logic Branching
  if (intent === 'hesitation') {
      reply = "没关系，梦境有时就是朦朦胧胧的。我们可以只聊聊你记得的任何一个片段，或者一种感觉。不用急，慢慢来。";
  } else if (intent === 'anxious') {
      reply = "听到你这么说，我能感觉到那一刻的不安。深呼吸……在这里你是安全的。那种紧张感现在还在吗？还是只留在了梦里？";
      nextContext.stage = 'emotion_exploring';
  } else if (intent === 'request_analysis') {
      reply = "好的，结合你告诉我的这些，我为你整理了一份解析。希望能帮你理清思绪。";
      action = 'show_analysis';
      nextContext.stage = 'ready_for_analysis';
  } else {
      // Stage-based flow
      switch (context.stage) {
          case 'initial':
              if (intent === 'dream_desc') {
                  reply = "嗯……我听到了。这个梦发生的时候，周围的氛围是怎样的？或者说，它给了你一种什么样的直观感觉？（是压抑、自由，还是别的？）";
                  nextContext.stage = 'emotion_exploring';
              } else {
                  reply = "嗯，我在听。昨晚的梦里有什么特别的画面吗？";
              }
              break;
          
          case 'dream_collecting':
               reply = "还有其他的细节吗？比如颜色、声音，或者当时你身边有谁？";
               nextContext.stage = 'emotion_exploring';
               break;

          case 'emotion_exploring':
              if (intent === 'emotion_expr') {
                  reply = "这种感觉确实很强烈……拥抱这种情绪。除此之外，梦里还有什么让你印象深刻的细节吗？比如某个特定的物品或场景？";
                  nextContext.stage = 'deepening';
              } else {
                  reply = "这种感觉伴随着梦境的哪个部分最强烈呢？";
              }
              break;

          case 'deepening':
              if (context.turnCount > 3) {
                  reply = "谢谢你跟我分享这些。我觉得我已经大概理解了这个梦对你的意义。你想现在看看解析吗？";
                  nextContext.stage = 'ready_for_analysis';
              } else {
                  reply = "这很有意思……仿佛是一个隐喻。你觉得这和现实生活中的某件事有联系吗？";
              }
              break;
          
          case 'ready_for_analysis':
              reply = "好的，我们来看看这个梦可能想告诉你什么。";
              action = 'show_analysis';
              break;
      }
  }
  
  // Fallback if empty
  if (!reply) {
      reply = "嗯，请继续说，我在听。";
  }

  return {
      text: reply,
      newContext: nextContext,
      action
  };
}
