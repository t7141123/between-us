# -*- coding: utf-8 -*-
"""
Category: vision (價值與未來 / Values & Future)
Authoritative Sources:
- Dr. John Gottman: Love Maps (Hopes & Dreams, 52 Questions)
- Sound Relationship House: Creating Shared Meaning
- The School of Life: Family Baggage & Worldview
- PREPARE/ENRICH: Future Goals & Life Priorities
"""

VISION_QUESTIONS = [
    {
        "tw": "在你的個人價值觀裡，有哪一項原則是你絕對不會為任何人妥協的？",
        "cn": "在你的个人价值观里，有哪一项原则是你绝对不会为任何人妥协的？",
        "en": "What core personal value or moral principle do you refuse to compromise on, no matter what?"
    },
    {
        "tw": "你心底深處最渴望被實現、但平時很少主動提起的秘密夢想或隱藏願望是什麼？",
        "cn": "你心底深处最渴望被实现、但平时很少主动提起的秘密梦想或隐藏愿望是什么？",
        "en": "What is your fondest unrealized dream or secret ambition that you rarely bring up in daily conversation?"
    },
    {
        "tw": "當你想像五年或十年後的我們，你最害怕我們在瑣碎現實中不知不覺失去什麼特質？",
        "cn": "当你想象五年或十年后的我们，你最害怕我们在琐碎现实中不知不觉失去什么特质？",
        "en": "When you look 5 or 10 years ahead, what quality about us do you most fear losing in the daily grind?"
    },
    {
        "tw": "在你成長的原生家庭裡，有哪一項相處模式或規矩，是你發誓絕對不想複製到我們家裡的？",
        "cn": "在你成长的原生家庭里，有哪一项相处模式或规矩，是你发誓绝对不想复制到我们家里的？",
        "en": "What rule or relationship pattern from your childhood home are you determined never to repeat in our home?"
    },
    {
        "tw": "如果有一天我們面臨重大變故（例如一方失業或健康出狀況），你希望我們用什麼態度共同承擔？",
        "cn": "如果有一天我们面临重大变故（例如一方失业或健康出状况），你希望我们用什么态度共同承担？",
        "en": "If we were ever hit by a major life crisis—like losing a job or a health scare—what mindset do you hope we share to face it?"
    },
    {
        "tw": "在你看來，兩個人要把日子長久過得踏實舒服，最要緊的生活能力不是賺錢或做家務，而是什麼？",
        "cn": "在你看来，两个人要把日子长久过得踏实舒服，最要紧的生活能力不是赚钱或做家务，而是什么？",
        "en": "In your opinion, what is the single most vital life skill for keeping a long-term partnership peaceful and grounded?"
    },
    {
        "tw": "如果在未來的日子裡我們感到彼此漸漸疏遠，你希望我們用什麼信號或約定立刻把對方拉回來？",
        "cn": "如果在未来的日子里我们感到彼此渐渐疏远，你希望我们用什么信号或约定立刻把对方拉回来？",
        "en": "If life pulls us into a distant drifting phase, what signal or pact should we have to immediately reel each other back in?"
    },
    {
        "tw": "回顧我們現在的生活節奏，你覺得哪一部分消耗了你最多的心力、最迫切需要重新調配？",
        "cn": "回顾我们现在的生活节奏，你觉得哪一部分消耗了你最多的心力、最迫切需要重新调配？",
        "en": "Looking at the current rhythm of our daily life, what part drains the most of your energy and needs rebalancing?"
    },
    {
        "tw": "未來面對各自父母年邁需要照顧時，你希望我們如何平衡『照顧父母』與『守護我們核心小家庭界線』？",
        "cn": "未来面对各自父母年迈需要照顾时，你希望我们如何平衡“照顾父母”与“守护我们核心小家庭界线”？",
        "en": "As our parents age, how do you hope we balance supporting them while protecting the boundaries of our own home?"
    },
    {
        "tw": "當身邊的朋友提起我們這一對，你最希望聽到他們用哪兩個詞來形容我們相處的氣場？",
        "cn": "当身边的朋友提起我们这一对，你最希望听到他们用哪两个词来形容我们相处的气场？",
        "en": "When close friends describe our relationship to others, what two words do you hope naturally come to their minds?"
    },
    {
        "tw": "在你的生命歷程中，哪一位長輩或前輩的婚姻生活，最符合你心目中理想伴侶的模樣？為什麼？",
        "cn": "在你的生命历程中，哪一位长辈或前辈的婚姻生活，最符合你心目中理想伴侣的模样？为什么？",
        "en": "Whose long-term relationship or marriage in your life has served as the best positive role model for you, and why?"
    },
    {
        "tw": "如果未來我們有機會選擇移居到另一個完全陌生的城市生活三年，你最看重那個地方的什麼特質？",
        "cn": "如果未来我们有机会选择移居到另一个完全陌生的城市生活三年，你最看重那个地方的什么特质？",
        "en": "If we had the chance to live in a completely new city or country for three years, what environment would nourish you most?"
    },
    {
        "tw": "面對『一起變老、外貌老去』這件事，你心底深處最期待的和最害怕的各是什麼？",
        "cn": "面对“一起变老、外貌老去”这件事，你心底深处最期待的和最害怕的各是什么？",
        "en": "When contemplating growing old together, what is your sweetest anticipation, and what is your deepest quiet fear?"
    },
    {
        "tw": "你心目中最理想的退休生活，除了一定的積蓄，一定少不了哪三件能讓你心靈充實的事情？",
        "cn": "你心目中最理想的退休生活，除了一定的积蓄，一定少不了哪三件能让你心灵充实的事情？",
        "en": "Besides financial security, what three meaningful pursuits must exist for your dream retirement to feel fulfilling?"
    },
    {
        "tw": "在眼前這兩三年內，你覺得我們最需要共同專注衝刺的一個大目標是什麼？",
        "cn": "在眼前这两三年内，你觉得我们最需要共同专注冲刺的一个大目标是什么？",
        "en": "Over the next two to three years, what single shared milestone or goal should receive our greatest joint focus?"
    },
    {
        "tw": "在你的內心深處，你覺得一個人真正成熟、可以對另一個人的一生負責任的標誌是什麼？",
        "cn": "在你的内心深处，你觉得一个人真正成熟、可以对另一个人的一生负责任的标志是什么？",
        "en": "In your heart, what is the true hallmark of personal maturity that shows someone is ready for lifelong commitment?"
    },
    {
        "tw": "當我們將來在教育孩子或重要決策上意見嚴重分歧時，你希望我們採取怎樣的決策機制？",
        "cn": "当我们将来在教育孩子或重要决策上意见严重分歧时，你希望我们采取怎样的决策机制？",
        "en": "When we find ourselves at complete odds over a major decision, what fair conflict resolution protocol should we trust?"
    },
    {
        "tw": "你希望走進我們家的客人或朋友，一踏進家門第一時間能感受到什麼樣的家庭氛圍？",
        "cn": "你希望走进我们家的客人或朋友，一踏进家门第一时间能感受到什么样的家庭氛围？",
        "en": "When guests or loved ones enter our home, what sensory feeling and emotional energy do you want them to immediately sense?"
    },
    {
        "tw": "如果幾十年後我們都離開了這個世界，你最希望我們留給身邊的人一筆怎樣的無形精神遺產？",
        "cn": "如果几十年后我们都离开了这个世界，你最希望我们留给身边的人一笔怎样的无形精神遗产？",
        "en": "When our lives are completed decades from now, what intangible emotional legacy do you want to have left behind?"
    },
    {
        "tw": "在我們目前的相處中，有哪一個默契或小習慣是你覺得非常珍貴、無論生活多忙都想維持一輩子的？",
        "cn": "在我们目前的相处中，有哪一个小默契或小习惯是你觉得非常珍贵、无论生活多忙都想维持一辈子的？",
        "en": "What small unspoken ritual between us right now feels so precious that you want to preserve it for life?"
    },
    {
        "tw": "如果時光倒流五年，看著那時的自己，你覺得現在的你身上最大的價值觀轉變是什麼？",
        "cn": "如果时光倒流五年，看着那时的自己，你觉得现在的你身上最大的价值观转变是什么？",
        "en": "If you looked back at yourself five years ago, what has been the most profound shift in what you truly value in life?"
    },
    {
        "tw": "對於『個人獨處時間』和『兩人黏在一起的時間』，你目前的內心比例是多少？有覺得被擠壓嗎？",
        "cn": "对于“个人独处时间”和“两人黏在一起的时间”，你目前的内心比例是多少？有觉得被挤压吗？",
        "en": "What is your ideal internal balance between solitary alone-time and coupled time? Do you feel crowded or starved currently?"
    },
    {
        "tw": "如果將來我們遇到人生的瓶頸期、感到生活停滯不前，你最希望我如何陪伴你重新找回熱情？",
        "cn": "如果将来我们遇到人生的瓶颈期、感到生活停滞不前，你最希望我如何陪伴你重新找回热情？",
        "en": "If you ever hit a season of personal stagnation or existential burnout, how can I best walk alongside you without pressuring you?"
    },
    {
        "tw": "在你看來，『成功的關係』究竟該如何定義？是相敬如賓、白頭偕老，還是彼此激勵成就自我？",
        "cn": "在你看来，“成功的关系”究竟该如何定义？是相敬如宾、白头偕老，还是彼此激励成就自我？",
        "en": "How do you personally define a truly 'successful' relationship? Is it longevity, peace, or mutual evolution?"
    },
    {
        "tw": "如果你突然擁有了一整年完全無憂無慮的空白假期，你最想投入去深入探索的一件事是什麼？",
        "cn": "如果你突然拥有了一整年完全无忧无虑的空白假期，你最想投入去深入探索的一件事是什么？",
        "en": "If you were granted a completely funded, obligation-free sabbatical year, what personal curiosity would you immerse yourself in?"
    },
    {
        "tw": "在我們共同生活的規劃中，你最看重的三個核心底線是什麼？（例如財務安全、情緒平穩、坦誠溝通）",
        "cn": "在我们共同生活的规划中，你最看重的三个核心底线是什么？（例如财务安全、情绪平稳、坦诚沟通）",
        "en": "What are your top three non-negotiable pillars for our shared household (e.g. financial transparency, emotional safety, honesty)?"
    },
    {
        "tw": "當我們步入七八十歲白髮蒼蒼時，你最希望我們每天傍晚一起做的一件小事是什麼？",
        "cn": "当我们步入七八十岁白发苍苍时，你最希望我们每天傍晚一起做的一件小事是什么？",
        "en": "When we are in our eighties with silver hair, what simple twilight routine do you picture us sharing every single evening?"
    },
    {
        "tw": "如果世界在未來幾年變得更加不確定，你覺得我們兩個人之間最需要建立的韌性是什麼？",
        "cn": "如果世界在未来几年变得更加不确定，你觉得我们两个人之间最需要建立的韧性是什么？",
        "en": "As the world grows increasingly unpredictable, what kind of mutual emotional resilience must we cultivate as a team?"
    },
    {
        "tw": "在你看來，好的婚姻或伴侶關係，是讓兩個人合而為一，還是成為兩個更自由獨立的個體？",
        "cn": "在你看来，好的婚姻或伴侣关系，是让两个人合而为一，还是成为两个更自由独立个体？",
        "en": "Do you view deep love as two people merging into one united entity, or as two sovereign individuals cheering on each other's freedom?"
    },
    {
        "tw": "回顧過去這一年我們共同面對的考驗，哪一個瞬間讓你覺得『有你在身邊，真的太好了』？",
        "cn": "回顾过去这一年我们共同面对的考验，哪一个瞬间让你觉得“有你在身边，真的太好了”？",
        "en": "Looking at the hurdles we faced over the past year, which exact moment made you breathe a sigh of gratitude for my presence?"
    },
    {
        "tw": "在你的心目中，生活裡的『儀式感』究竟是不可或缺的調味劑，還是偶爾會帶來負擔的壓力？",
        "cn": "在你的心目中，生活里的“仪式感”究竟是不可或缺的调味剂，还是偶尔会带来负担的压力？",
        "en": "In your mind, do romantic rituals feel like life-giving fuel, or do they sometimes create unspoken pressure or obligation?"
    },
    {
        "tw": "如果有一天你發現我對生活的熱情逐漸消退、變得麻木，你最希望用什麼方式溫柔地提醒我？",
        "cn": "如果有一天你发现我对生活的热情逐渐消退、变得麻木，你最希望用什么方式温柔地提醒我？",
        "en": "If you notice my spark for life fading into numbness or cynicism, how would you gently reach in and wake me up?"
    },
    {
        "tw": "在你看來，兩個人在一起久了，所謂的『默契』是自然發生的，還是需要刻意練習與經營的？",
        "cn": "在你看来，两个人在一起久了，所谓的“默契”是自然发生的，还是需要刻意练习与经营的？",
        "en": "Do you believe true intimacy and understanding happen organically with time, or do they require deliberate, active maintenance?"
    },
    {
        "tw": "在你心底，有沒有哪一個曾經熱切相信過、但後來被現實打碎的信念？這件事如何改變了你的世界觀？",
        "cn": "在你心底，有没有哪一个曾经热切相信过、但后来被现实打碎的信念？这件事如何改变了你的世界观？",
        "en": "What was an idealistic belief you held fiercely in youth that life eventually shattered, and how did that redefine your worldview?"
    },
    {
        "tw": "如果將來我們在生活重心上出現落差（例如一方全心投入事業，另一方更看重家庭享受），我們該如何調和？",
        "cn": "如果将来我们在生活重心上出现落差（例如一方全心投入事业，另一方更看重家庭享受），我们该如何调和？",
        "en": "If our life rhythms diverge—where one is intensely ambitious and the other craves domestic ease—how should we bridge the gap?"
    },
    {
        "tw": "在所有我們共同擁有的回憶中，哪一段旅程或時光最能代表你心目中『這就是我想過的生活』？",
        "cn": "在所有我们共同拥有的回忆中，哪一段旅程或时光最能代表你心目中“这就是我想过的生活”？",
        "en": "Among all our shared memories, which trip or quiet season best encapsulates the exact feeling of the life you want to live?"
    },
    {
        "tw": "如果我們身邊最親近的朋友遭遇嚴重的感情危機，這件事會如何促使你反思我們現在的相處方式？",
        "cn": "如果我们身边最亲近的朋友遭遇严重的情感危机，这件事会如何促使你反思我们现在的相处方式？",
        "en": "When close friends around us suffer relationship breakdowns, what cautionary lessons do you quietly reflect upon for us?"
    },
    {
        "tw": "在你看來，『家』這個空間最核心的功能，是提供完美的秩序與效率，還是讓人隨時可以卸下偽裝徹底耍廢？",
        "cn": "在你看来，“家”这个空间最核心的功能，是提供完美的秩序与效率，还是让人随时可以卸下伪装彻底耍废？",
        "en": "At its deepest level, should our home be a sanctuary of order and productivity, or a place where we can totally fall apart and be messy?"
    },
    {
        "tw": "如果你有能力改變我們日常生活中的一個微小習慣，而且這個改變會持續五年，你最希望改變什麼？",
        "cn": "如果你有能力改变我们日常生活中的一个微小习惯，而且这个改变会持续五年，你最希望改变什么？",
        "en": "If you had the magic to permanently shift one daily habit of ours for the next five years, what change would yield the highest joy?"
    },
    {
        "tw": "對於彼此的社交圈與人際關係，你希望我們保有怎樣的界線？（是幾乎完全重疊，還是各自獨立自由？）",
        "cn": "对于彼此的社交圈与人际关系，你希望我们保有怎样的界线？（是几乎完全重叠，还是各自独立自由？）",
        "en": "How do you envision our friendship circles? Do you prefer our friends to be fully intertwined, or distinct and independent?"
    },
    {
        "tw": "在你的定義裡，什麼樣的時刻會讓你感覺到兩個人之間的靈魂是在同一個頻率上共振的？",
        "cn": "在你的定义里，什么样的时刻会让你感觉到两个人之间的灵魂是在同一个频率上共振的？",
        "en": "In your experience, what kind of moment creates that rare sensation where our souls feel like they are vibrating on the exact same frequency?"
    },
    {
        "tw": "如果未來我們面臨是否要迎接新生命的抉擇（或是毛小孩），你最看重的準備工作是什麼？",
        "cn": "如果未来我们面临是否要迎接新生命的抉择（或是毛小孩），你最看重的准备工作是什么？",
        "en": "When deciding whether to expand our family (with children or pets), what internal emotional readiness matters most to you?"
    },
    {
        "tw": "當你看著現在的社會氛圍與生活壓力，你覺得我們兩個人最需要共同抵禦的一種外界侵蝕是什麼？",
        "cn": "当你看着现在的社会氛围与生活压力，你觉得我们两个人最需要共同抵御的一种外界侵蚀是什么？",
        "en": "Looking at modern societal pressures, what harmful external mindset do we need to fiercely protect our relationship against?"
    },
    {
        "tw": "如果用一句話總結你希望我們在彼此生命中扮演的角色，那句話會是什麼？",
        "cn": "如果用一句话总结你希望我们在彼此生命中扮演的角色，那句话会是什么？",
        "en": "If you could distill the ultimate role you want us to play in each other's lifelong story into one sentence, what would it be?"
    },
    {
        "tw": "面對不可避免的生活瑣事與柴米油鹽，你希望我們用怎樣的幽默感來化解摩擦？",
        "cn": "面对不可避免的生活琐事与柴米油盐，你希望我们用怎样的幽默感来化解摩擦？",
        "en": "Amid the inevitable domestic tedium of chores and bills, what kind of playful humor do you hope we always keep alive?"
    },
    {
        "tw": "在你的直覺裡，有哪一個夢想清單上的目標，是如果沒有跟我一起完成，你一定會覺得遺憾萬分的？",
        "cn": "在你的直觉里，有哪一个梦想清单上的目标，是如果没有跟我一起完成，你一定会觉得遗憾万分的？",
        "en": "What bucket-list adventure or dream would feel hollow and incomplete if you weren't experiencing it by my side?"
    },
    {
        "tw": "在我們兩人的相處中，你覺得目前最被低估、但其實至關重要的一種能力是什麼？",
        "cn": "在我们两人的相处中，你觉得目前最被低估、但其实至关重要的一种能力是什么？",
        "en": "What subtle, quiet dynamic between us do you feel is currently underrated, but is actually holding us together strongly?"
    },
    {
        "tw": "當你有一天離開這份全職工作退休時，你最希望自己的心態是鬆了一口氣，還是充滿對未來的探險慾望？",
        "cn": "当你有一天离开这份全职工作退休时，你最希望自己的心态是松了一口气，还是充满对未来的探险欲望？",
        "en": "When you finally step away from your full-time career, do you crave deep restorative stillness, or a hungry burst of new exploration?"
    },
    {
        "tw": "走入這段關係至今，你最感激我身上的哪一種堅持或特質，讓你對我們的未來充滿踏實感？",
        "cn": "走入这段关系至今，你最感激我身上的哪一种坚持或特质，让你对我们的未来充满踏实感？",
        "en": "Looking at the journey we've walked so far, what enduring quality in me gives you the deepest, most quiet certainty about tomorrow?"
    },
    {
        "tw": "如果為我們未來的人生寫下一句核心座右銘或墓誌銘，你希望那是一句怎樣的話？",
        "cn": "如果为我们未来的人生写下一句核心座右铭或墓志铭，你希望那是一句怎样的话？",
        "en": "If you could write a single core family motto or epitaph summarizing our shared life together, what would you want it to say?"
    }
]
