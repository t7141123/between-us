# -*- coding: utf-8 -*-
"""
Category: soul (心靈與情緒 / Heart & Vulnerability)
Authoritative Sources:
- Dr. Arthur Aron: 36 Questions That Lead to Love (Vulnerability & Closeness)
- We're Not Really Strangers (WNRS): Level 2 Connection
- The School of Life: Attachment, Family Baggage, Flaws Treated Generously
- Sue Johnson (EFT): Underlying Primary Emotions
"""

SOUL_QUESTIONS = [
    {
        "tw": "最近這段時間，有沒有什麼焦慮或壓力是你心裡在默默抗衡，但我可能完全沒注意到的？",
        "cn": "最近这段时间，有没有什么焦虑或压力是你心里在默默抗衡，但我可能完全没注意到的？",
        "en": "What emotional weight or quiet worry are you carrying right now that I might have failed to notice?"
    },
    {
        "tw": "在別人眼裡你可能很獨立堅強，但在我身邊時，你最容易因為什麼事感到自卑或懷疑自己？",
        "cn": "在别人眼里你可能很独立坚强，但在我身边时，你最容易因为什么事感到自卑或怀疑自己？",
        "en": "You present a capable face to the outside world, but where do you feel most secretly insecure or not good enough when you're with me?"
    },
    {
        "tw": "你身上哪一個連你自己都覺得不太可愛的盲點或缺點，最渴望被我溫柔、寬容地對待？",
        "cn": "你身上哪一个连你自己都觉得不太可爱的盲点或缺点，最渴望被我温柔、宽容地对待？",
        "en": "Which of your personal flaws or rough edges would you most love to be treated with deep, patient generosity?"
    },
    {
        "tw": "回想你的成長經歷，哪一次被忽視或不被理解的記憶，至今依然會悄悄影響你對親密關係的安全感？",
        "cn": "回想你的成长经历，哪一次被忽视或不被理解的记忆，至今依然会悄悄影响你对亲密关系的安全感？",
        "en": "What painful memory of being dismissed or misunderstood in childhood still casts a shadow over how safe you feel in love today?"
    },
    {
        "tw": "上一次你在我面前（或獨自一人時）忍不住想哭，心底最核心的委屈或脆弱是什麼？",
        "cn": "上一次你在我面前（或独自一人时）忍不住想哭，心底最核心的委屈或脆弱是什么？",
        "en": "When you last cried—whether in front of me or in private—what raw feeling or vulnerability was sitting at the bottom of those tears?"
    },
    {
        "tw": "在我們相處時，有哪種特定的時刻或我的說話語氣，會讓你突然退縮、覺得自己不被接納？",
        "cn": "在我们相处时，有哪种特定的时刻或我的说话语气，会让你突然退缩、觉得自己不被接纳？",
        "en": "What tone of voice or subtle gesture from me unintentionally triggers your defensiveness or makes you feel emotionally shut out?"
    },
    {
        "tw": "如果可以拋開所有防備，你現在最想從我這裡聽到一句什麼樣的肯定或安慰？",
        "cn": "如果可以抛开所有防备，你现在最想从我这里听到一句什么样的肯定或安慰？",
        "en": "If you lowered all your defenses completely, what reassuring truth do you most crave hearing from my lips right now?"
    },
    {
        "tw": "在所有你認識的人當中，如果今天失去誰會讓你感到整個世界崩塌？你最害怕失去的是那份什麼樣的情感？",
        "cn": "在所有你认识的人当中，如果今天失去谁会让你感到整个世界崩塌？你最害怕失去的是那份什么样的情感？",
        "en": "Of all the people in your life, whose absence would feel like the world crumbling, and what emotional anchor would you mourn the most?"
    },
    {
        "tw": "你覺得在你的內心世界裡，最難向外人敞開、甚至連我都很難完全看透的那個角落是什麼？",
        "cn": "你觉得在你的内心世界里，最难向外人敞开、甚至连我都很准完全看透的那个角落是什么？",
        "en": "What chamber of your inner world feels hardest to open up, even to someone as close as me?"
    },
    {
        "tw": "有什麼話題是你在我面前一直很想提、卻總害怕會引起衝突或讓我失望而猶豫不決的？",
        "cn": "有什么话题是你在我面前一直很想提、却总害怕会引起冲突或让我失望而犹豫不决的？",
        "en": "What tender topic have you wanted to unpack with me, but held back out of fear that it might cause tension or hurt?"
    },
    {
        "tw": "今天回到家關上門的那一刻，卸下一整天的武裝，你心裡最真實的電量百分比是多少？",
        "cn": "今天回到家关上门的那一刻，卸下一整天的武装，你心里最真实的人体电量百分比是多少？",
        "en": "When you close the front door and drop your mask at night, what is your honest internal battery percentage?"
    },
    {
        "tw": "上一次你覺得被我『真正聽懂、深深理解到心坎裡』，是哪一個具體的瞬間？",
        "cn": "上一次你觉得被我“真正听懂、深深理解到心坎里”，是哪一个具体的瞬间？",
        "en": "When was the last time you felt truly, deeply heard and witnessed by me in your core?"
    },
    {
        "tw": "當你感到極度疲憊或情緒低落時，我的哪一種反應會讓你覺得被治癒，哪一種反而會讓你更累？",
        "cn": "当你感到极度疲惫或情绪低落时，我的哪一种反应会让你觉得被治愈，哪一种反而会让你更累？",
        "en": "When you are depleted, what response from me actually heals you, and what well-intentioned advice accidentally drains you further?"
    },
    {
        "tw": "在你心底，有沒有哪一個秘密傷痕，是即使到現在回想起來，心裡依然會隱隱作痛的？",
        "cn": "在你心底，有没有哪一个秘密伤痕，是即使到现在回想起来，心里依然会隐隐作痛的？",
        "en": "What old wound from your past still stings with fresh vulnerability whenever life presses against it?"
    },
    {
        "tw": "在你看來，你最容易在什麼樣的情況下感到孤單？即使身邊有人陪著，那種孤單感依然存在嗎？",
        "cn": "在你看来，你最容易在什么样的情况下感到孤单？即使身边有人陪着，那种孤单感依然存在吗？",
        "en": "In what moments do you feel the sharpest sense of loneliness, even when surrounded by company?"
    },
    {
        "tw": "你小時候在原生家庭裡，當你哭泣或發脾氣時，你的父母通常是用什麼方式對待你的？這如何影響了你現在發洩情緒的方式？",
        "cn": "你小时候在原生家庭里，当你哭泣或发脾气时，你的父母通常是用什么方式对待你的？这如何影响了你现在发泄情绪的方式？",
        "en": "Growing up, how did your parents respond when you were crying or angry? How does that shape how you show or suppress distress today?"
    },
    {
        "tw": "在我們相處的這些日子裡，有沒有哪一次我的無心之言，其實深深刺痛了你，但你當時選擇了隱忍沒有說？",
        "cn": "在我们相处的这些日子里，有没有哪一次我的无心之言，其实深深刺痛了你，但你当时选择了隐忍没有说？",
        "en": "Has there been an offhand comment I made that wounded you far deeper than I realized, which you swallowed in silence?"
    },
    {
        "tw": "如果有一天你覺得自己的人生一敗塗地、失去了所有光環，你覺得我還會用同樣的目光深愛你嗎？你心裡有過動搖嗎？",
        "cn": "如果有一天你觉得自己的人生一败涂地、失去了所有光环，你觉得我还会用同样的目光深爱你吗？你心里有过动摇吗？",
        "en": "If external success stripped away and you felt like an utter failure, do you trust that my adoration for you would remain unshakeable?"
    },
    {
        "tw": "在你看來，你最害怕被最親近的人發現的一面是什麼？是軟弱、自私、還是不知所措的恐懼？",
        "cn": "在你看来，你最害怕被最亲近的人发现的一面是什么？是软弱、自私、还是不知所措的恐惧？",
        "en": "What secret part of yourself are you most terrified of loved ones uncovering: your weakness, your selfishness, or your panic?"
    },
    {
        "tw": "當你面對重大壓力時，你的直覺反應通常是把自己封閉起來自我消化，還是渴望找人傾訴？",
        "cn": "当你面对重大压力时，你的直觉反应通常是把自己封闭起来自我消化，还是渴望找人倾诉？",
        "en": "Under intense stress, is your gut instinct to withdraw into a protective cave, or do you ache for an empathetic ear?"
    },
    {
        "tw": "在我們這段關係裡，你最感到被理解、被全盤接納的一個瞬間是什麼時候？",
        "cn": "在我们这段关系里，你最感到被理解、被全盘接纳的一个瞬间是什么时候？",
        "en": "What moment in our relationship made you realize, with a full breath of relief: 'I am safe to be my genuine self here'?"
    },
    {
        "tw": "如果用一種天氣或自然現象來形容你這週的心情狀態，那會是狂風暴雨、陰鬱起霧，還是暖陽微風？",
        "cn": "如果用一种天气或自然现象来形容你这周的心情状态，那会是狂风暴雨、阴郁起雾，还是暖阳微风？",
        "en": "If your emotional state over the past week was an internal weather pattern, would it be heavy fog, turbulent squalls, or gentle sunshine?"
    },
    {
        "tw": "你有沒有哪一個習慣或防衛心理，是明知道對彼此溝通不利，但在情緒上頭時依然很難克制的？",
        "cn": "你有没有哪一个习惯或防卫心理，是明知道对彼此沟通不利，但在情绪上头时依然很难克制的？",
        "en": "What emotional reflex do you recognize as counterproductive in arguments, yet struggle fiercely to interrupt when flooded?"
    },
    {
        "tw": "在你心底，最容易讓你產生罪惡感（Guilt）的事情通常與什麼有關？你是否總是對自己過度苛刻？",
        "cn": "在你心底，最容易让你产生罪恶感（Guilt）的事情通常与什么有关？你是否总是对自己过度苛刻？",
        "en": "What triggers your inner critic into merciless guilt trips, and where do you judge yourself far more harshly than anyone else?"
    },
    {
        "tw": "如果今天可以對十年前那個在黑暗中迷惘掙扎的自己說一句話，你最想走過去給他怎樣的一個擁抱和安慰？",
        "cn": "如果今天可以对十年前那个在黑暗中迷惘挣扎的自己说一句话，你最想走过去给他怎样的一个拥抱和安慰？",
        "en": "If you could step back ten years and sit beside your younger, struggling self, what tender words of assurance would you offer?"
    },
    {
        "tw": "當你看著我為了生活忙碌疲累時，你在那一瞬間湧現的心情是心疼、無力感，還是有一絲害怕？",
        "cn": "当你看着我为了生活忙碌疲累时，你在那一瞬间涌现的心情是心疼、无力感，还是有一丝害怕？",
        "en": "When you see me visibly drained from life's demands, what complex mixture of tenderness, helplessness, or anxiety stirs inside you?"
    },
    {
        "tw": "在你看來，『把脆弱展現給另一半』這件事，對你而言是水到渠成的安心，還是需要深吸一口氣的冒險？",
        "cn": "在你看来，“把脆弱展现给另一半”这件事，对你而言是水到渠成的安心，还是需要深吸一口气的冒险？",
        "en": "Does exposing your deepest vulnerability to me feel like stepping into warm safety, or taking a terrifying leap of faith?"
    },
    {
        "tw": "在你的生命中，有沒有哪一次勇敢說出真心話、卻換來嚴重受傷的經歷？那件事是如何改變你的？",
        "cn": "在你的生命中，有没有哪一次勇敢说出真心话、却换来严重受伤的经历？那件事是如何改变你的？",
        "en": "Was there a formative moment in your past when speaking your authentic truth resulted in devastating betrayal or ridicule?"
    },
    {
        "tw": "每當你在夜深人靜失眠時，腦海裡最常反覆盤旋、揮之不去的心事通常是什麼？",
        "cn": "每当你在夜深人静失眠时，脑海里最常反复盘旋、挥之不去的心事通常是什么？",
        "en": "When sleep eludes you in the dead of night, what recurring contemplation usually loops endlessly through your mind?"
    },
    {
        "tw": "如果現在有一個機會，可以讓我替你分擔你心頭上沉甸甸的一件事，你最希望我為你接下哪一部分？",
        "cn": "如果现在有一个机会，可以让我替你分担你心头上沉甸甸的一件事，你最希望我为你接下哪一部分？",
        "en": "If I could reach into your chest and take half the weight of one heavy burden you're carrying, which one would you hand over?"
    },
    {
        "tw": "在你看來，一個人在什麼時候展現出來的脆弱，反而會讓你覺得他無比性感且富有魅力？",
        "cn": "在你看来，一个人在什么时候展现出来的脆弱，反而会让你觉得他无比性感且富有魅力？",
        "en": "What kind of raw, defenseless honesty in a partner strikes you not as weak, but as deeply compelling and magnetic?"
    },
    {
        "tw": "回想過去這半年，有沒有哪一個瞬間你覺得自己幾乎瀕臨崩潰，但最後靠自己咬牙撐過來了？",
        "cn": "回想过去这半年，有没有哪一个瞬间你觉得自己几乎濒临崩溃，但最后靠自己咬牙撑过来了？",
        "en": "Over the past six months, what unseen storm pushed you to the brink of tears, where you held yourself together through sheer grit?"
    },
    {
        "tw": "在我們相處的空間裡，有什麼事情能讓你在五分鐘之內迅速找回安全感與平靜？",
        "cn": "在我们相处的空间里，有什么事情能让你在五分钟之内迅速找回安全感与平静？",
        "en": "Within our shared space, what specific comfort can ground your nervous system and restore peace in under five minutes?"
    },
    {
        "tw": "你覺得在你身上，最不容易被外人看穿的一種偽裝是什麼？（例如用幽默掩飾尷尬，用冷淡掩飾在乎）",
        "cn": "你觉得在你身上，最不容易被外人看穿的一种伪装是什么？（例如用幽默掩饰尴尬，用冷淡掩饰在乎）",
        "en": "What is your most seamless social armor: deflecting with humor, masking with intellectual logic, or wearing cold indifference?"
    },
    {
        "tw": "如果可以毫無顧忌地向我承認一個你心裡的『小陰暗面』或私密妒忌，你敢說出來嗎？那是什麼？",
        "cn": "如果可以毫无顾忌地向我承认一个你心里的“小阴暗面”或私密妒忌，你敢说出来吗？那是什么？",
        "en": "If you knew with absolute certainty that I would not judge you, what petty jealousy or shadowy impulse could you confess?"
    },
    {
        "tw": "當你在外面受了委屈或被誤解時，你最需要我先站在你這邊同仇敵愾，還是幫你冷靜客觀分析？",
        "cn": "当你在外面受了委屈或被误解时，你最需要我先站在你这边同仇敌忾，还是帮你冷静客观分析？",
        "en": "When you are wronged in the world, do you first need my fierce emotional loyalty, or my objective rational problem-solving?"
    },
    {
        "tw": "你心目中最恐懼的親密關係結局是什麼？是彼此仇恨、漸行漸遠形同陌路，還是為了責任勉強湊合？",
        "cn": "你心目中最恐惧的亲密关系结局是什么？是彼此仇恨、渐行渐远形同陌路，还是为了责任勉强凑合？",
        "en": "What is your worst relationship nightmare: dramatic hostility, a silent drifting apart into strangers, or numb coexistence for duty?"
    },
    {
        "tw": "在你看來，每當你感到情緒低落不想說話時，我怎樣的陪伴尺度最能讓你感到舒適不壓迫？",
        "cn": "在你看来，每当你感到情绪低落不想说话时，我怎样的陪伴尺度最能让你感到舒适不压迫？",
        "en": "When heavy silence falls over you, what distance of presence feels comforting rather than intrusive or suffocating?"
    },
    {
        "tw": "有沒有哪一段你過去的人生低谷，是形塑了現在堅強、但也讓你偶爾感到疲憊不堪的你的？",
        "cn": "有没有哪一段你过去的人生低谷，是形塑了现在坚强、但也让你偶尔感到疲惫不堪的你的？",
        "en": "What chapter of past survival forged your present strength, yet still leaves you feeling bone-weary from carrying it alone?"
    },
    {
        "tw": "在你看來，我們兩個人在一起時，你心底最深層被治癒的是童年哪一份遺憾？",
        "cn": "在你看来，我们两个人在一起时，你心底最深层被治愈的是童年哪一份遗憾？",
        "en": "In our quietest moments, what unmet longing or childhood absence feels gently soothed simply by being loved by you?"
    },
    {
        "tw": "如果向未來的我們借一份勇氣，你現在最想放下的內心執念或心理包袱是什麼？",
        "cn": "如果向未来的我们借一份勇气，你现在最想放下的内心执念或心理包袱是什么？",
        "en": "If you could borrow ten years of future perspective right now, what chronic worry or needless baggage would you immediately put down?"
    },
    {
        "tw": "當你面對不可抗力的挫折時，你最希望我握住你的手對你說出哪三個字？",
        "cn": "当你面对不可抗力的挫折时，你最希望我握住你的手对你说出哪三个字？",
        "en": "In moments of sheer helplessness, what three honest words whispered into your hand would anchor your trembling spirit?"
    },
    {
        "tw": "在你的精神世界裡，哪一種時刻會讓你感到心靈無比寧靜，彷彿時間都暫停了？",
        "cn": "在你的精神世界里，哪一种时刻会让你感到心灵无比宁静，仿佛时间都暂停了？",
        "en": "What sacred, unhurried moment makes the frantic clock of the modern world stop ticking for your soul?"
    },
    {
        "tw": "你覺得我們倆在日常生活中，還有哪一個情緒死角或盲區，是我們一直繞道而行、不敢直視的？",
        "cn": "你觉得我们俩在日常生活中，还有哪一个情绪死角或盲区，是我们一直绕道而行、不敢直视的？",
        "en": "What emotional third rail or recurring elephant in the room have we both quietly tiptoed around instead of confronting gently?"
    },
    {
        "tw": "每當你看著我毫無防備熟睡時的側臉，你的心底深處最常升起的一種情感是什麼？",
        "cn": "每当你看着我毫无防备熟睡时的侧脸，你的心底深处最常升起的一种情感是什么？",
        "en": "When you catch me asleep without defense, what primal tide of emotion rises most purely in your chest?"
    },
    {
        "tw": "如果可以消除你在過去關係中所受到的某一次背叛或創傷，那段記憶如果被抹去，你會變得更輕鬆嗎？",
        "cn": "如果可以消除你在过去关系中所受到的某一次背叛或创伤，那段记忆如果被抹去，你会变得更轻松吗？",
        "en": "If you could erase the scar tissue of a past heartbreak with a clean slate, do you think your capacity to love today would expand?"
    },
    {
        "tw": "在你看來，當一個人在關係中感到『安全』時，他會表現出怎樣不同以往的放鬆狀態？",
        "cn": "在你看来，当一个人在关系中感到“安全”时，他会表现出怎样不同以往的放松状态？",
        "en": "How can you tell, in your own body, when you have crossed from anxious guard duty into true emotional rest?"
    },
    {
        "tw": "此時此刻坐在我對面的你，有哪一份真摯的心聲是你以前從未鼓起勇氣對任何人說過的？",
        "cn": "此时此刻坐在我对面的你，有哪一份真挚的心声是你以前从未鼓起勇气对任何人说过的？",
        "en": "Looking at me across this table right now, what tender truth is waiting in your throat that has never been said to anyone before?"
    },
    {
        "tw": "如果用一個詞來形容你在我懷抱裡最真實的感受，那個詞會是自由、踏實，還是回家？",
        "cn": "如果用一个词来形容你在我怀抱里最真实的感受，那个词会是自由、踏实，还是回家？",
        "en": "When my arms wrap tightly around you, does your spirit exhale into freedom, anchor into solid earth, or arrive back home?"
    },
    {
        "tw": "謝謝你願意陪我走過這麼多幽微的心理角落，現在看著我的眼睛，你最想對我說的第一句話是什麼？",
        "cn": "谢谢你愿意陪我走过这么多幽微的心理角落，现在看着我的眼睛，你最想对我说的第一句话是什么？",
        "en": "Thank you for walking into the shadows with me. Looking straight into my eyes right now, what is the very first thing your heart wants to say?"
    }
]
