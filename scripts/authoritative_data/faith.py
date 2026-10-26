# scripts/authoritative_data/faith.py
# Reference: Dr. John Gottman ("What Makes Love Last?", Sliding Door Moments),
# Dr. Sue Johnson (EFT - Attachment Security, ARE: Accessible, Responsive, Engaged).

FAITH_QUESTIONS = [
    {
        "id": "faith_001",
        "question_tw": "在我們相處的這段時間裡，哪一個瞬間讓你最深切地感受到「我是絕對值得你信任的」？",
        "question_cn": "在我们相处的这段时间里，哪一个瞬间让你最深切地感受到“我是绝对值得你信任的”？",
        "question_en": "Throughout our time together, what moment made you feel most deeply that I am truly worthy of your trust?",
        "hint_tw": "回想一個你把脆弱或無助交給我，而我接住了你的時刻。",
        "hint_cn": "回想一个你把脆弱或无助交给我，而我接住了你的时刻。",
        "hint_en": "Think of a time when you let down your guard and I caught you with care."
    },
    {
        "id": "faith_002",
        "question_tw": "當你感到世界崩塌或身心俱疲時，我是你第一個想打電話的人嗎？如果不是，那份顧慮是什麼？",
        "question_cn": "当你感到世界崩塌或身心俱疲时，我是你第一个想打电话的人吗？如果不是，那份顾虑是什么？",
        "question_en": "When your world feels overwhelming or exhausting, am I the first person you reach for? If not, what holds you back?",
        "hint_tw": "坦白說出你在尋求安慰時的顧慮，是怕打擾還是怕不被理解？",
        "hint_cn": "坦白说出你在寻求安慰时的顾虑，是怕打扰还是怕不被理解？",
        "hint_en": "Share honestly whether fear of burdening or fear of misunderstanding stops you."
    },
    {
        "id": "faith_003",
        "question_tw": "對你來說，伴侶在異性或一般朋友交往上的「安全邊界」是什麼？有沒有哪條底線是絕對不能踩的？",
        "question_cn": "对你来说，伴侣在异性或一般朋友交往上的“安全边界”是什么？有没有哪条底线是绝对不能踩的？",
        "question_en": "What does a healthy emotional and physical boundary with friends look like to you? What is your non-negotiable line?",
        "hint_tw": "聊聊單獨赴約、深夜聊天、分享心事或身體界線的具體標準。",
        "hint_cn": "聊聊单独赴约、深夜聊天、分享心事或身体界线的具体标准。",
        "hint_en": "Discuss specific boundaries around 1-on-1 hangouts, late-night texting, or confiding secrets."
    },
    {
        "id": "faith_004",
        "question_tw": "有沒有哪一次我答應你的事情沒有做到，雖然你表面上沒說，但其實心裡悄悄失落了很久？",
        "question_cn": "有没有哪一次我答应你的事情没有做到，虽然你表面上没说，但其实心里悄悄失落了很久？",
        "question_en": "Was there an unkept promise I made that you didn't press on, but quietly carried a sense of letdown?",
        "hint_tw": "即使是生活中的微小承諾，未兌現的失落也值得被溫柔修補。",
        "hint_cn": "即使是生活中的微小承诺，未兑现的失落也值得被温柔修补。",
        "hint_en": "Even small unfulfilled commitments leave marks that deserve gentle healing."
    },
    {
        "id": "faith_005",
        "question_tw": "當我們產生意見分歧甚至爭執時，你內心深處會不會有「這段關係會不會就此結束」的恐慌感？",
        "question_cn": "当我们产生意见分歧甚至争执时，你内心深处会不会有“这段关系会不会就此结束”的恐慌感？",
        "question_en": "During our sharp disagreements or fights, do you ever secretly fear deep down that our relationship might end?",
        "hint_tw": "談談你的依戀類型：在衝突中你更容易感到被拋棄，還是更想躲進殼裡？",
        "hint_cn": "谈谈你的依恋类型：在冲突中你更容易感到被抛弃，还是更想躲进壳里？",
        "hint_en": "Reflect on attachment fears: do conflicts trigger abandonment panic or a desire to withdraw?"
    },
    {
        "id": "faith_006",
        "question_tw": "你覺得我們在手機和個人社群隱私上的透明度目前剛好嗎？你希望更公開還是更有個人空間？",
        "question_cn": "你觉得我们在手机和个人社交隐私上的透明度目前刚好吗？你希望更公开还是更有个人空间？",
        "question_en": "How comfortable are you with our current balance between privacy and transparency with phones and social media?",
        "hint_tw": "每對伴侶的舒適圈不同，說出讓你最有安全感但不窒息的相處模式。",
        "hint_cn": "每对伴侣的舒适圈不同，说出让你最有安全感但不窒息的相处模式。",
        "hint_en": "Define what brings emotional security without feeling controlling or suffocating."
    },
    {
        "id": "faith_007",
        "question_tw": "過去的感情或家庭經歷，是否曾留下讓你至今依然對關係保持戒備的某種陰影？",
        "question_cn": "过去的情感或家庭经历，是否曾留下让你至今依然对关系保持戒备的某种阴影？",
        "question_en": "Did past relationships or family wounds leave scars that still make you instinctively guarded today?",
        "hint_tw": "那些不是我的錯、但你需要我更有耐心陪伴你化解的舊傷痕。",
        "hint_cn": "那些不是我的错、但你需要我更有耐心陪伴你化解的旧伤痕。",
        "hint_en": "Wounds not caused by me, but where you need my extra tenderness and patience."
    },
    {
        "id": "faith_008",
        "question_tw": "在我表現出哪種微小舉動或眼神時，你會立刻警覺並感到不安，甚至開始懷疑自己做錯了什麼？",
        "question_cn": "在我表现出哪种微小举动或眼神时，你会立刻警觉并感到不安，甚至开始怀疑自己做错了什么？",
        "question_en": "What subtle micro-behavior or shift in my tone instantly makes you anxious or wonder if you did something wrong?",
        "hint_tw": "例如突然的沉默、嘆氣、皺眉或冷淡的簡訊回覆。",
        "hint_cn": "例如突然的沉默、叹气、皱眉或冷淡的短信回复。",
        "hint_en": "Such as a sudden sigh, brief withdrawal, furrowed brow, or flat texting tone."
    },
    {
        "id": "faith_009",
        "question_tw": "如果有一天你生了重病或遭遇嚴重的人生低谷，你百分之百確信我會毫無怨言地守在你身邊照顧你嗎？",
        "question_cn": "如果有一天你生了重病或遭遇严重的人生低谷，你百分之百确信我会毫无怨言地守在你身边照顾你吗？",
        "question_en": "If you faced a major illness or deep life setback, are you 100% confident I would steadfastly care for you without resentment?",
        "hint_tw": "這份關於生老病死的「承諾重量」，我們在彼此眼中是否有足夠的底氣？",
        "hint_cn": "这份关于生老病死的“承诺重量”，我们在彼此眼中是否有足够的底气？",
        "hint_en": "Exploring whether we both feel the enduring weight and steadiness of our commitment."
    },
    {
        "id": "faith_010",
        "question_tw": "你覺得我是一個在外界誘惑或考驗面前，原則與道德感足夠堅定、經得起考驗的人嗎？",
        "question_cn": "你觉得我是一个在外界诱惑或考验面前，原则与道德感足够坚定、经得起考验的人吗？",
        "question_en": "Do you view me as someone whose moral integrity and loyalty remain unshakeable when faced with external temptation?",
        "hint_tw": "誠實說出你對我自律能力與人格特質的信心與評價。",
        "hint_cn": "诚实说出你对我自律能力与人格特质的信心与评价。",
        "hint_en": "Speak candidly about how much faith you place in my self-discipline and character."
    },
    {
        "id": "faith_011",
        "question_tw": "在我們相處中，有沒有哪件事你因為害怕我生氣、受傷或批評，而至今依然不敢對我全盤托出？",
        "question_cn": "在我们相处中，有没有哪件事你因为害怕我生气、受伤或批评，而至今依然不敢对我全盘托出？",
        "question_en": "Is there anything you haven't fully confided in me out of fear that I would react with anger, hurt, or judgment?",
        "hint_tw": "創造一個絕對安全的「免責空間」，邀請對方安心吐露。",
        "hint_cn": "创造一个绝对安全的“免责空间”，邀请对方安心吐露。",
        "hint_en": "Offer a completely safe, judgment-free space to listen without defending."
    },
    {
        "id": "faith_012",
        "question_tw": "當你在外受了委屈或被別人欺負時，你是否相信無論發生什麼事，我都一定會站在你身邊保護你？",
        "question_cn": "当你在外受了委屈或被别人欺负时，你是否相信无论发生什么事，我都一定会站在你身边保护你？",
        "question_en": "When you're treated unfairly in the outside world, do you truly trust that I will fiercely stand in your corner?",
        "hint_tw": "伴侶是彼此對抗整個世界最堅固的後盾，你感受到這份托底感了嗎？",
        "hint_cn": "伴侣是彼此对抗整个世界最坚固的后盾，你感受到这份托底感了吗？",
        "hint_en": "A partner is the ultimate anchor against the world; do you feel that solid backing?"
    },
    {
        "id": "faith_013",
        "question_tw": "如果滿分是 10 分，你給我們目前的「情感安全感」打幾分？要達到 10 分，還需要補足什麼？",
        "question_cn": "如果满分是 10 分，你给我们目前的“情感安全感”打几分？要达到 10 分，还需要补足什么？",
        "question_en": "On a scale of 1 to 10, how safe do you feel in our relationship today? What is missing to get to a 10?",
        "hint_tw": "不需要客套，具體指出扣掉的分數來自哪一方面的顧慮或缺口。",
        "hint_cn": "不需要客套，具体指出扣掉的分数来自哪一方面的顾虑或缺口。",
        "hint_en": "Be honest about the gap and name the concrete reassurances that would bridge it."
    },
    {
        "id": "faith_014",
        "question_tw": "你覺得我們之間有沒有某個「碰不得的地雷區」？一聊到那個話題，兩人都會變得防禦或焦慮？",
        "question_cn": "你觉得我们之间有没有某个“碰不得的地雷区”？一聊到那个话题，两人都会变得防御或焦虑？",
        "question_en": "Is there a delicate taboo territory between us that instantly sparks defensiveness or tension whenever touched?",
        "hint_tw": "可能是某段前塵往事、某位家人、某筆支出或某個遲遲未決的承諾。",
        "hint_cn": "可能是某段前尘往事、某位家人、某笔支出或某个迟迟未决的承诺。",
        "hint_en": "Could be an ex, a family dynamic, a financial topic, or a delayed milestone."
    },
    {
        "id": "faith_015",
        "question_tw": "當我跟其他朋友或同事外出時，你心裡會偶爾浮現不安嗎？我做什麼能讓你更安心踏實？",
        "question_cn": "当我跟其他朋友或同事外出时，你心里会偶尔浮现不安吗？我做做什么能让你更安心踏实？",
        "question_en": "When I am out socializing with colleagues or friends, do subtle worries cross your mind? What can I do to reassure you?",
        "hint_tw": "主動報備行蹤、拍照分享還是回家後的親暱擁抱？",
        "hint_cn": "主动报备行踪、拍照分享还是回家后的亲昵拥抱？",
        "hint_en": "A spontaneous text update, sending a quick photo, or a warm embrace when I get home?"
    },
    {
        "id": "faith_016",
        "question_tw": "如果我遇到了重大的道德抉擇或犯了嚴重的錯誤，你相信我會第一時間告訴你，還是先試圖隱瞞？",
        "question_cn": "如果我遇到了重大的道德抉择或犯了严重的错误，你相信我会第一时间告诉你，还是先试图隐瞒？",
        "question_en": "If I faced an agonizing moral dilemma or made a major error, do you believe I'd tell you right away or try to hide it?",
        "hint_tw": "探討在彼此面前承認自身不堪與失敗時，這段關係是否有足夠的安全厚度。",
        "hint_cn": "探讨在彼此面前承认自身不堪与失败时，这段关系是否有足够的安全厚度。",
        "hint_en": "Reflect on whether we have enough relational cushion to admit failures without fear."
    },
    {
        "id": "faith_017",
        "question_tw": "你覺得「信任」在一段長久關係中，是一旦破壞就永遠無法復原，還是可以透過努力重新建構的？",
        "question_cn": "你觉得“信任”在一张长久关系中，是一旦破坏就永远无法复原，还是可以通过努力重新建构的？",
        "question_en": "Do you believe trust in a lifelong partnership is permanently shattered once broken, or can it be rebuilt with intentional work?",
        "hint_tw": "分享你對「原諒」與「重建安全感」的心理極限與看法。",
        "hint_cn": "分享你对“原谅”与“重建安全感”的心理极限与看法。",
        "hint_en": "Share your perspective on the emotional threshold for forgiveness and rebuilding."
    },
    {
        "id": "faith_018",
        "question_tw": "在我們平時的相處中，我曾說過哪一句話，無意間刺傷了你對我的信任或讓你感到孤單？",
        "question_cn": "在我们平时的相处中，我曾说过哪一句话，无意间刺伤了你对我的信任或让你感到孤单？",
        "question_en": "What words have I spoken carelessly that inadvertently bruised your trust or left you feeling emotionally alone?",
        "hint_tw": "也許說者無心但聽者有意，給彼此一個說開並釋懷的機會。",
        "hint_cn": "也许说者无心但听者有意，给彼此一个说开并释怀的机会。",
        "hint_en": "Give us a chance to acknowledge and release accidental wounds spoken without malice."
    },
    {
        "id": "faith_019",
        "question_tw": "你是否曾感覺過，在這段關係裡你愛得比我多、付出得比我多，因此承受了更多患得患失的壓力？",
        "question_cn": "你是否曾感觉过，在这段关系里你爱得比我多、付出得比我多，因此承受了更多患得患失的压力？",
        "question_en": "Have you ever felt that you love or invest more in this relationship than I do, making you feel emotionally vulnerable?",
        "hint_tw": "感受愛的失衡是安全感流失的溫床，請坦率告訴我你的感受。",
        "hint_cn": "感受爱的失衡是安全感流失的温床，请坦率告诉我你的感受。",
        "hint_en": "A perceived emotional imbalance easily breeds insecurity; be raw and direct."
    },
    {
        "id": "faith_020",
        "question_tw": "當你跟我分享你的夢想、脆弱或恐懼時，你曾感覺到我漫不經心或未被真正重視嗎？",
        "question_cn": "当你跟我分享你的梦想、脆弱或恐惧时，你曾感觉到我漫不经心或未被真正重视吗？",
        "question_en": "When sharing your deep hopes, fears, or raw vulnerabilities, did you ever feel I was distracted or tuning you out?",
        "hint_tw": "高特曼所謂的「滑門時刻」（Sliding Door Moments）：每一次轉向對方的邀請都被視為信任的基石。",
        "hint_cn": "高特曼所谓的“滑门时刻”（Sliding Door Moments）：每一次转向对方的邀请都被视为信任的基石。",
        "hint_en": "Gottman's Sliding Door Moments: every small bid for emotional connection builds or erodes trust."
    },
    {
        "id": "faith_021",
        "question_tw": "在你的定義中，「精神出軌」與「純粹欣賞優秀的人」兩者之間的界線劃在哪裡？",
        "question_cn": "在你的定义中，“精神出轨”与“纯粹欣赏优秀的人”两者之间的界线划在哪里？",
        "question_en": "In your book, where exactly is the line drawn between healthy appreciation of others and emotional infidelity?",
        "hint_tw": "探討情感寄託、向伴侶隱瞞互動、以及心靈依賴的界限。",
        "hint_cn": "探讨情感寄托、向伴侣隐瞒互动、以及心灵依赖的界限。",
        "hint_en": "Explore the boundaries of secretive emotional dependency versus platonic admiration."
    },
    {
        "id": "faith_022",
        "question_tw": "你有沒有什麼過去未解開的心結，導致你在感情中很容易過度解讀對方的冷淡或遲回簡訊？",
        "question_cn": "你有没有什么过去未解开的心结，导致你在感情中很容易过度解读对方的冷淡或迟回短信？",
        "question_en": "Do you hold any unresolved past trauma that makes you hyper-vigilant about delayed replies or perceived distance?",
        "hint_tw": "聊聊童年或過往受挫的經驗，如何塑造了你今天的安全感觸發點。",
        "hint_cn": "聊聊童年或过往受挫的经验，如何塑造了你今天的安全感触发点。",
        "hint_en": "Discuss how childhood dynamics or past betrayals shaped your present anxiety triggers."
    },
    {
        "id": "faith_023",
        "question_tw": "如果有一天我們面臨遠距離相處（如工作調派、出國進修），你對我們的信任度有多高？你會擔心什麼？",
        "question_cn": "如果有一天我们面临远距离相处（如工作调派、出国进修），你对我们的信任度有多高？你会担心什么？",
        "question_en": "If life forced us into a long-distance season, how confident are you in our bond? What would keep you awake at night?",
        "hint_tw": "想像距離與時差對溝通習慣和親密感的考驗，我們該如何守護安全感？",
        "hint_cn": "想象距离与时差对沟通习惯和亲密感的考验，我们该如何守护安全感？",
        "hint_en": "Anticipate the challenges of physical absence and consider proactive rituals to stay anchored."
    },
    {
        "id": "faith_024",
        "question_tw": "當我看著你說「我愛你」時，你心底深處是百分之百毫無懷疑地收下，還是會有一絲不敢確信？",
        "question_cn": "当看着你说“我爱你”时，你心底深处是百分之百毫无怀疑地收下，还是会有一丝不敢确信？",
        "question_en": "When I look into your eyes and say 'I love you', does your heart absorb it with complete certainty, or does a hint of doubt linger?",
        "hint_tw": "探討自己是否覺得自己「值得被深深愛著」，這是深層安全感的核心。",
        "hint_cn": "探讨自己是否觉得自己“值得被深深爱着”，这是深层安全感的核心。",
        "hint_en": "Exploring your own sense of worthiness to receive deep, enduring affection."
    },
    {
        "id": "faith_025",
        "question_tw": "在我們平時的對話中，你是否曾感覺我會用冷嘲熱諷或開玩笑的方式貶低你，讓你在關係中不敢做自己？",
        "question_cn": "在我们平时的对话中，你是否曾感觉我会用冷嘲热讽或开玩笑的方式贬低你，让在这段关系中不敢做自己？",
        "question_en": "In daily banter, have I ever disguised subtle put-downs or sarcasm as jokes that eroded your psychological safety?",
        "hint_tw": "語言的刺常常包裝在幽默之下，檢視我們是否給予了對方足夠的敬重。",
        "hint_cn": "语言的刺常常包装在幽默之下，检视我们是否给予了对方足够的敬重。",
        "hint_en": "Sarcasm can cloak subtle contempt; examine whether our humor always preserves dignity."
    },
    {
        "id": "faith_026",
        "question_tw": "你有沒有看過我的家人或朋友對我的評價，而那些評價一度讓你對我的人品或未來產生動搖？",
        "question_cn": "你有没有看过我的家人或朋友对我的评价，而那些评价一度让你对我的人品或未来产生动摇？",
        "question_en": "Has anything my family or friends said about me ever made you second-guess my reliability or character?",
        "hint_tw": "外在的聲音有時會引發疑慮，說出來讓我們有機會釐清真實的自己。",
        "hint_cn": "外在的声音有时会引发疑虑，说出来让我们有机会厘清真实的新自己。",
        "hint_en": "External opinions can seed quiet doubt; share them openly so we can bring clarity."
    },
    {
        "id": "faith_027",
        "question_tw": "當你看到我情緒低落或沉默不語時，你會擔心是我在生你的氣，還是能安穩地給予我空間？",
        "question_cn": "当你看到我情绪低落或沉默不语时，你会担心是我在生你的气，还是能安稳地给予我空间？",
        "question_en": "When I withdraw or feel down, do you instinctively panic thinking it's your fault, or can you securely hold space for me?",
        "hint_tw": "分辨伴侶的情緒低潮是個人壓力還是關係問題，需要強大的安全信任。",
        "hint_cn": "分辨伴侣的情绪低潮是个人压力还是关系问题，需要强大的安全信任。",
        "hint_en": "Differentiating personal stress from relationship tension requires grounded relational faith."
    },
    {
        "id": "faith_028",
        "question_tw": "你覺得我們在金錢使用上的誠實度如何？你是否曾有過「瞞著伴侶買東西或借錢」的念頭或行為？",
        "question_cn": "你觉得我们在金钱使用上的诚实度如何？你是否曾有过“瞒着伴侣买东西或借钱”的念头或行为？",
        "question_en": "How transparent are we with financial choices? Have you ever felt the urge to make secret purchases or hide loans?",
        "hint_tw": "財務背叛（Financial Infidelity）對信任的殺傷力不亞於情感背叛。",
        "hint_cn": "财务背叛（Financial Infidelity）对信任的杀伤力不亚于情感背叛。",
        "hint_en": "Financial secrecy can damage trust just as deeply as romantic betrayal."
    },
    {
        "id": "faith_029",
        "question_tw": "在你看來，一對伴侶要如何做到「即便全世界都誤解我，我知道你絕對懂我、信我」的至高境界？",
        "question_cn": "在你看来，一对伴侣要如何做到“即便全世界都误解我，我知道你绝对懂我、信我”的至高境界？",
        "question_en": "In your eyes, what builds the profound conviction that 'even if the entire world doubts me, my partner believes in me'?",
        "hint_tw": "聊聊你需要怎樣的陪伴，才能在最黑暗孤立的時刻依然感到被無條件信任。",
        "hint_cn": "聊聊你需要怎样的陪伴，才能在最黑暗孤立的时刻依然感到被无条件信任。",
        "hint_en": "What emotional foundation allows you to feel unconditionally backed during your darkest isolation?"
    },
    {
        "id": "faith_030",
        "question_tw": "如果我突然告訴你我需要看心理諮商或感到憂鬱，你會覺得這是一個負擔，還是願意陪我走過？",
        "question_cn": "如果我突然告诉你我需要看心理咨询或感到抑郁，你会觉得这是一个负担，还是愿意陪我走过？",
        "question_en": "If I opened up that I'm struggling with clinical depression or need therapy, would it feel like a heavy burden or a journey we face together?",
        "hint_tw": "心理健康的起伏是人生的常態，檢視我們是否能坦然面對彼此的精神脆弱。",
        "hint_cn": "心理健康的起伏是人生的常态，检视我们是否能坦然面对彼此的精神脆弱。",
        "hint_en": "Mental health fluctuations happen; examine our ability to hold emotional space with grace."
    },
    {
        "id": "faith_031",
        "question_tw": "你曾懷疑過我跟你在一起的動機嗎？（例如貪圖安全感、外表、物質條件，而非真心愛你整個人）？",
        "question_cn": "你曾怀疑过我跟你在一起的动机吗？（例如贪图安全感、外表、物质条件，而非真心爱你整个人）？",
        "question_en": "Have you ever doubted why I chose you—wondering if it was convenience, looks, or stability rather than authentic love for who you are?",
        "hint_tw": "吐露心底最不自信的那份不安，讓對方用真誠的話語為你驅散疑雲。",
        "hint_cn": "吐露心底最不自信的那份不安，让对方用真诚的话语为你驱散疑云。",
        "hint_en": "Air your quietest insecurities so your partner can reassure you with heartfelt clarity."
    },
    {
        "id": "faith_032",
        "question_tw": "當你把最深層的秘密或過往醜事告訴我時，你曾擔心有一天吵架時我會把它拿來當武器攻擊你嗎？",
        "question_cn": "当你把最深层的秘密或过往丑事告诉我时，你曾担心有一天吵架时我会把它拿来当武器攻击你吗？",
        "question_en": "When sharing your deepest secrets or past regrets, do you ever fear that I might weaponize them against you in an argument?",
        "hint_tw": "真正的安全感，是深知自己的脆弱絕不會被對方在憤怒時當作刺向自己的利刃。",
        "hint_cn": "真正的安全感，是深知自己的脆弱绝不会被对方在愤怒时当作刺向自己的利刃。",
        "hint_en": "True psychological safety means knowing vulnerabilities will never be weaponized during fights."
    },
    {
        "id": "faith_033",
        "question_tw": "在我們日常的相處中，我曾在哪個微小的承諾上讓你感到踏實無比（例如準時出現、細心記住某件事）？",
        "question_cn": "在我们日常的相处中，我曾在哪个微小的承诺上让你感到踏实无比（例如准时出现、细心记住某件事）？",
        "question_en": "What tiny everyday consistency of mine makes you feel deeply anchored (e.g., showing up on time, remembering small details)?",
        "hint_tw": "安全感往往累積在無數個微小的可靠細節中，肯定對方的用心付出。",
        "hint_cn": "安全感往往累积在无数个微小的可靠细节中，肯定对方的用心付出。",
        "hint_en": "Trust is woven from quiet, mundane consistencies; honor what is already strong."
    },
    {
        "id": "faith_034",
        "question_tw": "如果我需要暫時離開這段關係幾天去獨處靜思，這會引發你強烈的恐慌，還是你能平靜信任？",
        "question_cn": "如果我需要暂时离开这段关系几天去独处静思，这会引发你强烈的恐慌，还是你能平静信任？",
        "question_en": "If I asked for a couple of days of solitary retreat to recharge, would it spark deep panic or could you trust the space peacefully?",
        "hint_tw": "探討個人空間與親密依附之間的張力，以及如何在分開時保持連結。",
        "hint_cn": "探讨个人空间与亲密依附之间的张力，以及如何在分开时保持连结。",
        "hint_en": "Examine the healthy tension between personal space and attachment, and how to maintain warmth during solitude."
    },
    {
        "id": "faith_035",
        "question_tw": "你覺得我是一個擅長「說到做到」的人嗎？我說過哪句話曾讓你覺得只是哄你，而不是真心的？",
        "question_cn": "你觉得我是一个擅长“说到做到”的人吗？我说过哪句话曾让你觉得只是哄你，而不是真心的？",
        "question_en": "Do you perceive me as someone whose word is gold? What has felt like mere placating rather than a genuine promise?",
        "hint_tw": "敷衍的安撫會悄悄磨損信任，釐清哪些許諾需要更加具體與篤定。",
        "hint_cn": "敷衍的安抚会悄悄磨损信任，厘清哪些许诺需要更加具体与笃定。",
        "hint_en": "Empty appeasement chips away at trust; clarify which commitments need concrete follow-through."
    },
    {
        "id": "faith_036",
        "question_tw": "在彼此的原生家庭面前，你是否絕對相信我會堅定地維護你，不讓你受委屈或被冷落？",
        "question_cn": "在彼此的原生家庭面前，你是否绝对相信我会坚定地维护你，不让你受委屈或被冷落？",
        "question_en": "In front of my family of origin, do you trust without doubt that I will defend you and never let you feel alienated?",
        "hint_tw": "伴侶在婆媳、岳婿或家族場合的表態，往往是信任最重要的試金石。",
        "hint_cn": "伴侣在婆媳、岳婿或家族场合的表态，往往是信任最重要的试金石。",
        "hint_en": "Standing up for one's partner against in-law dynamics is often the ultimate test of loyalty."
    },
    {
        "id": "faith_037",
        "question_tw": "如果我們之間產生了誤會，你更傾向於立刻質問、獨自生悶氣暗自觀察，還是坦率尋求對質？",
        "question_cn": "如果我们之间产生了误会，你更倾向于立刻质问、独自生闷气暗自观察，还是坦率寻求对质？",
        "question_en": "When misunderstandings arise, do you lean toward confronting immediately, quietly stewing and observing, or seeking gentle clarity?",
        "hint_tw": "了解彼此面對懷疑時的防衛反應，有助於建立更透明的核對機制。",
        "hint_cn": "了解彼此面对怀疑时的防卫反应，有助于建立更透明的核对机制。",
        "hint_en": "Understanding your defensive instincts helps create a healthier protocol for checking in."
    },
    {
        "id": "faith_038",
        "question_tw": "你曾因為看到我在社群媒體上的點讚、留言或追蹤名單，而在心裡悄悄感到不舒服過嗎？",
        "question_cn": "你曾因为看到我在社交媒体上的点赞、留言或关注名单，而在心里悄悄感到不舒服过吗？",
        "question_en": "Have my social media likes, comments, or follow lists ever caused you quiet twinges of discomfort or insecurity?",
        "hint_tw": "數位時代的新型安全感考驗，把那些看似微小卻刺痛的小事說出來。",
        "hint_cn": "数字时代的新型安全感考验，把那些看似微小却刺痛的小事说出来。",
        "hint_en": "Digital age vulnerabilities: surface those small online interactions that stung."
    },
    {
        "id": "faith_039",
        "question_tw": "你覺得我們在情緒崩潰時，彼此具備足夠的「安全急救包」嗎？你最需要我如何接住你的崩潰？",
        "question_cn": "你觉得我们在情绪崩溃时，彼此具备足够的“安全急救包”吗？你最需要我如何接住你的崩溃？",
        "question_en": "Do we have an effective 'emotional first-aid kit' for when one of us falls apart? How do you most need me to hold you?",
        "hint_tw": "給予具體的指令：是需要一個堅定長久的無言擁抱、一杯溫水，還是安靜的陪伴？",
        "hint_cn": "给予具体的指令：是需要一个坚定长久的无言拥抱、一杯温水，还是安静的陪伴？",
        "hint_en": "Give concrete guidance: a long silent hug, a warm cup of water, or simply sitting beside you quietly."
    },
    {
        "id": "faith_040",
        "question_tw": "在你看來，「永遠不背叛彼此」這份承諾，究竟是靠雙方的道德自律，還是靠長久用心經營的深刻連結？",
        "question_cn": "在你看来，“永远不背叛彼此”这份承诺，究竟是靠双方的道德自律，还是靠长久用心经营的深刻连结？",
        "question_en": "In your view, does fidelity over decades rely primarily on moral willpower, or on continuously nurturing a deeply connected bond?",
        "hint_tw": "高特曼指出：忠誠不是偶然，而是每天在無數個微小瞬間選擇轉向伴侶的結果。",
        "hint_cn": "高特曼指出：忠诚不是偶然，而是每天在无数个微小瞬间选择转向伴侣的结果。",
        "hint_en": "Gottman notes: loyalty isn't luck; it's chosen in hundreds of tiny daily bids for intimacy."
    },
    {
        "id": "faith_041",
        "question_tw": "當我跟其他有魅力的人共事或接觸時，你內心會有那一瞬間的比較心或不自信嗎？",
        "question_cn": "当我跟其他有魅力的人共事或接触时，你内心会有那一瞬间的比较心或不自信吗？",
        "question_en": "When I collaborate with charismatic people, does a fleeting voice of comparison or insecurity whisper inside you?",
        "hint_tw": "承認人性中本能的比較與嫉妒，正是建立更真實信任的第一步。",
        "hint_cn": "承认人性中本能的比较与嫉妒，正是建立更真实信任的第一步。",
        "hint_en": "Acknowledging involuntary comparison or jealousy is the doorway to authentic mutual reassurance."
    },
    {
        "id": "faith_042",
        "question_tw": "我們之間有沒有哪一個秘密，是你一直想要對我坦白，但總覺得「現在還不是最好的時機」？",
        "question_cn": "我们之间有没有哪一个秘密，是你一直想要对我坦白，但总觉得“现在还不是最好的时机”？",
        "question_en": "Is there a secret you've been wanting to share with me, but have kept waiting for 'just the right moment'?",
        "hint_tw": "如果今晚氣氛正好，也許現在就是讓心靈完全裸露、彼此靠近的最佳時機。",
        "hint_cn": "如果今晚气氛正好，也许现在就是让心灵完全裸露、彼此靠近的最佳时机。",
        "hint_en": "If tonight feels calm and safe, maybe this is the perfect moment to unclothe your heart."
    },
    {
        "id": "faith_043",
        "question_tw": "你曾害怕過有一天我會厭倦你、覺得你無聊，或者對你失去當初那份心動與熱情嗎？",
        "question_cn": "你曾害怕过有一天我会厌倦你、觉得你无聊，或者对你失去当初那份心动与热情吗？",
        "question_en": "Have you ever feared that one day I might grow bored of you or lose the spark that initially drew me to you?",
        "hint_tw": "說出你對長久激情退潮後的恐懼，聽聽伴侶如何看待這份平淡與細水長流。",
        "hint_cn": "说出你对长久激情退潮后的恐惧，听听伴侣如何看待这份平淡与细水长流。",
        "hint_en": "Voice your vulnerability about passion waning, and hear how your partner cherishes lasting calm."
    },
    {
        "id": "faith_044",
        "question_tw": "在我們關係的低潮期，你曾產生過「如果換一個人會不會更輕鬆」的短暫念頭嗎？那時是什麼拉住了你？",
        "question_cn": "在我们关系的低潮期，你曾产生过“如果换一个人会不会更轻松”的短暂念头吗？那时是什么拉住了你？",
        "question_en": "During our rough patches, did the fleeting thought ever cross your mind that being with someone else might be easier? What anchored you?",
        "hint_tw": "敢於坦白短暫的動搖，更能印證最終選擇留下的那份珍貴決心。",
        "hint_cn": "敢于坦白短暂的动摇，更能印证最终选择留下的那份珍贵决心。",
        "hint_en": "Courageously admitting fleeting doubt only highlights the deliberate choice you made to stay."
    },
    {
        "id": "faith_045",
        "question_tw": "你覺得我們是否建立了一套「吵架後絕對不會過夜、不冷暴力」的默契原則？落實得好嗎？",
        "question_cn": "你觉得我们是否建立了一套“吵架后绝不过夜、不冷暴力”的默契原则？落实得好吗？",
        "question_en": "Do you feel we have a solid pact to never let fights fester overnight and never use stonewalling? How well do we uphold it?",
        "hint_tw": "冷暴力是關係的隱形殺手，檢視我們在生氣時如何依然傳遞「我依然在乎這段關係」。",
        "hint_cn": "冷暴力是关系的隐形杀手，检视我们在生气时如何依然传递“我依然在乎这段关系”。",
        "hint_en": "Stonewalling kills connection; review how we signal that the bond remains safe even when hurt."
    },
    {
        "id": "faith_046",
        "question_tw": "當你表現出脆弱或哭泣時，你感受到的是被接納、被珍視，還是有一種被催促「快點好起來」的壓力？",
        "question_cn": "当你表现出脆弱或哭泣时，你感受到的是被接纳、被珍视，还是有一种被催促“快点好起来”的压力？",
        "question_en": "When you cry or show raw vulnerability, do you feel safely held, or do you feel pressured to 'get over it quickly'?",
        "hint_tw": "真正的安全感是允許悲傷停留，而不是急著給出解決方案或要求正面情緒。",
        "hint_cn": "真正的安全感是允许悲伤停留，而不是急着给出解决方案或要求正面情绪。",
        "hint_en": "True emotional safety allows grief to breathe, without rushing to fixes or toxic positivity."
    },
    {
        "id": "faith_047",
        "question_tw": "在彼此的朋友圈中，我是否有給你足夠的「官方伴侶正宮認可」？還是曾讓你感到被藏起來？",
        "question_cn": "在彼此的朋友圈中，我是否有给你足够的“官方伴侣正宫认可”？还是曾让你感到被藏起来？",
        "question_en": "In my social spheres, do you feel proudly claimed as my primary partner, or have you ever felt hidden away?",
        "hint_tw": "被公開承認與驕傲介紹，是信任基石中不可或缺的肯定感。",
        "hint_cn": "被公开承认与骄傲介绍，是信任基石中不可或缺的肯定感。",
        "hint_en": "Being openly acknowledged and proudly claimed is a vital pillar of relational security."
    },
    {
        "id": "faith_048",
        "question_tw": "如果有一天我們面臨嚴重的財務困難或失業危機，你相信我們會同甘共苦、還是會因此反目成仇？",
        "question_cn": "如果有一天我们面临严重的财务困难或失业危机，你相信我们会同甘共苦、还是会因此反目成仇？",
        "question_en": "If we faced severe financial hardship or prolonged unemployment, do you believe we'd pull together or tear each other apart?",
        "hint_tw": "困境最考驗關係的韌性，聊聊我們能在狂風暴雨中依靠彼此的信心來源。",
        "hint_cn": "困境最考验关系的韧性，聊聊我们能在狂风暴雨中依靠彼此的信心来源。",
        "hint_en": "Hardship tests resilience; explore why you believe we can weather storms without blaming each other."
    },
    {
        "id": "faith_049",
        "question_tw": "你覺得我是一個在感情中「有擔當」的人嗎？哪一次的經歷讓你深刻感受到了這一點？",
        "question_cn": "你觉得我是一个在感情中“有担当”的人吗？哪一次的经历让你深刻感受到了这一点？",
        "question_en": "Do you consider me a partner of genuine accountability? What moment demonstrated that responsibility most deeply?",
        "hint_tw": "主動承擔責任、不推卸過錯，是贏得深刻信任的最成熟表現。",
        "hint_cn": "主动承担责任、不推卸过错，是赢得深刻信任的最成熟表现。",
        "hint_en": "Taking ownership of mistakes without excuses is the hallmark of trustworthy maturity."
    },
    {
        "id": "faith_050",
        "question_tw": "如果用一句話向對方許下一個關於未來的「絕對安全承諾」，你現在最想對我說什麼？",
        "question_cn": "如果用一句话向对方许下一个关于未来的“绝对安全承诺”，你现在最想对我说什么？",
        "question_en": "If you could gift me one ironclad vow of unconditional safety for our future right now, what would your heart say?",
        "hint_tw": "看著對方的眼睛，給予一個不需要宏大誓言、卻無比真實踏實的約定。",
        "hint_cn": "看着对方的眼睛，给予一个不需要宏大誓言、却无比真实踏实的约定。",
        "hint_en": "Look into each other's eyes and offer a grounding, realistic promise of lifelong presence."
    }
]
