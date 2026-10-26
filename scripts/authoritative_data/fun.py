# scripts/authoritative_data/fun.py
# Reference: We're Not Really Strangers (Level 1: Perception),
# Dr. John Gottman (Playfulness, Shared Meaning & Fondness in Daily Life),
# The School of Life (Self-Knowledge, Quirks, Humor in Human Nature).

FUN_QUESTIONS = [
    {
        "id": "fun_001",
        "question_tw": "第一次見到我時，你對我的第一印象是什麼？跟後來真正認識的我相比，反差最大的是哪一點？",
        "question_cn": "第一次见到我时，你对我的第一印象是什么？跟后来真正认识的我相比，反差最大的是哪一点？",
        "question_en": "What was your very first impression of me? What was the most hilarious or surprising contrast once you got to know me?",
        "hint_tw": "坦白說出當初有沒有什麼自以為是的誤會或偏見！",
        "hint_cn": "坦白说出当初有没有什么自以为是的误会或偏见！",
        "hint_en": "Confess any wild assumptions or hilarious misjudgments you held back then!"
    },
    {
        "id": "fun_002",
        "question_tw": "如果我是一隻動物，你覺得我是什麼品種？為什麼？那你是什麼動物來跟我生活？",
        "question_cn": "如果我是一只动物，你觉得我是什么品种？为什么？那你是什么动物来跟我生活？",
        "question_en": "If I were an animal, what specific breed would I be and why? And what animal would you be living alongside me?",
        "hint_tw": "從作息、飲食習慣、脾氣和撒嬌方式來發揮想像力。",
        "hint_cn": "从作息、饮食习惯、脾气和撒娇方式来发挥想象力。",
        "hint_en": "Think about sleep schedules, feeding habits, temperaments, and ways of cuddling."
    },
    {
        "id": "fun_003",
        "question_tw": "我有哪一個只有你知道的「獨家可愛小怪癖」，每次看到都讓你忍不住想笑？",
        "question_cn": "我有一个哪只有你知道的“独家可爱小怪癖”，每次看到都让你忍不住想笑？",
        "question_en": "What is a quirky, bizarre little habit of mine that only you know about and always makes you giggle?",
        "hint_tw": "例如睡覺的特殊姿勢、吃東西的奇怪儀式、或者生氣時的特定碎念。",
        "hint_cn": "例如睡觉的特殊姿势、吃东西的奇怪仪式、或者生气时的特定碎念。",
        "hint_en": "Could be an odd sleeping ritual, idiosyncratic eating order, or weird muttering."
    },
    {
        "id": "fun_004",
        "question_tw": "如果明天突然爆發「喪屍末日」，我們兩個人誰會先領便當？我們能活過第幾天？",
        "question_cn": "如果明天突然爆发“丧尸末日”，我们两个人谁会先领便当？我们能活过第几天？",
        "question_en": "If a zombie apocalypse broke out tomorrow, which of us would die first? How many days would we survive?",
        "hint_tw": "依據兩個人的體能、方向感、膽量與關鍵時刻的反應來分析戰力！",
        "hint_cn": "依据两个人的体能、方向感、胆量与关键时刻的反应来分析战力！",
        "hint_en": "Analyze our combat readiness: navigation, cardio, panic thresholds, and survival instincts!"
    },
    {
        "id": "fun_005",
        "question_tw": "在我們一起經歷過的所有約會或旅行中，哪一次稱得上是「最荒謬或最災難，但回想起來最好笑」的？",
        "question_cn": "在我们一起经历过的所有约会或旅行中，哪一次称得上是“最荒谬或最灾难，但回想起来最好笑”的？",
        "question_en": "Of all our dates or trips together, which one was an absolute disaster at the time, but the funniest memory now?",
        "hint_tw": "迷路、暴雨、難吃的大雷餐廳，還是荒謬的意外事件？",
        "hint_cn": "迷路、暴雨、难吃的大雷餐厅，还是荒谬的意外事件？",
        "hint_en": "Getting stranded, torrential downpours, atrocious food, or ridiculous travel misadventures?"
    },
    {
        "id": "fun_006",
        "question_tw": "如果讓你偷偷用我的手機發一條限時動態，而且我一整天都不能刪除，你會發什麼內容？",
        "question_cn": "如果让你偷偷用我的手机发一条限时动态，而且我一整天都不能删除，你会发什么内容？",
        "question_en": "If you could secretly post one story on my Instagram that I wasn't allowed to delete for 24 hours, what would it say?",
        "hint_tw": "是自戀自拍、肉麻情話，還是徹底黑化我的黑歷史照片？",
        "hint_cn": "是自恋自拍、肉麻情话，还是彻底黑化我的黑历史照片？",
        "hint_en": "A cringey love proclamation, a goofy selfie, or an unforgivable candid photo?"
    },
    {
        "id": "fun_007",
        "question_tw": "如果我們兩個決定組隊去搶銀行，你覺得我們各自會擔任什麼角色？會在哪個環節露餡被抓？",
        "question_cn": "如果我们两个决定组队去抢银行，你觉得我们各自会担任什么角色？会在哪个环节露馅被抓？",
        "question_en": "If we decided to rob a bank together, what would our respective roles be, and at what ridiculous step would we get caught?",
        "hint_tw": "誰是策劃大腦、誰是車手、誰會因為買咖啡或看導航迷路而壞事？",
        "hint_cn": "谁是策划大脑、谁是车手、谁会因为买咖啡或看导航迷路而坏事？",
        "hint_en": "Who's the mastermind, who's the getaway driver, and who ruins the heist stopping for a snack?"
    },
    {
        "id": "fun_008",
        "question_tw": "你覺得我什麼時候看起來最像個「三歲小孩」？那個瞬間我做了什麼？",
        "question_cn": "你觉得我什么时候看起来最像个“三岁小孩”？那个瞬间我做了什么？",
        "question_en": "When do I look most like an actual three-year-old child to you? What am I doing in that moment?",
        "hint_tw": "例如肚子餓想睡覺時鬧脾氣、看到喜歡的玩具美食時兩眼放光的模樣。",
        "hint_cn": "例如肚子饿想睡觉时闹脾气、看到喜欢的玩具美食时两眼放光的模样。",
        "hint_en": "Throwing a hangry tantrum, pouting when sleepy, or squealing at a favorite dessert."
    },
    {
        "id": "fun_009",
        "question_tw": "如果我們必須互換身體 24 小時，你最想體驗當我時的哪件事？你最害怕搞砸我的什麼事？",
        "question_cn": "如果我们必须互换身体 24 小时，你最想体验当我时的哪件事？你最害怕搞砸我的什么事？",
        "question_en": "If we swapped bodies for 24 hours, what would you be most eager to experience, and what part of my life would you fear ruining?",
        "hint_tw": "換個視角看世界、體驗伴侶的日常生活，到底會有多混亂？",
        "hint_cn": "换个视角看世界、体验伴侣的日常生活，到底会有多混乱？",
        "hint_en": "See the world through each other's shoes—how much comedic chaos would unfold?"
    },
    {
        "id": "fun_010",
        "question_tw": "如果現在把我們倆扔到一個荒島上，只能帶「三樣我們家裡現有的東西」，你會選哪三樣？",
        "question_cn": "如果现在把我们俩扔到一个荒岛上，只能带“三样我们家里现有的东西”，你会选哪三样？",
        "question_en": "If we were stranded on a deserted island and could only bring three items currently in our house, what do you pick?",
        "hint_tw": "只能從家裡隨手抓，看看誰的生存哲學更離譜或更實用！",
        "hint_cn": "只能从家里随手抓，看看谁的生存哲学更离谱或更实用！",
        "hint_en": "Items must be in our actual home right now—pragmatic survival gear or pure comfort junk?"
    },
    {
        "id": "fun_011",
        "question_tw": "在你看來，如果用一道「料理或小吃」來形容我們兩個的日常感情，那會是什麼？",
        "question_cn": "在你看来，如果用一道“料理或小吃”来形容我们两个的日常感情，那会是什么？",
        "question_en": "If our daily relationship were a specific dish or street food, what would it be and why?",
        "hint_tw": "是熱騰騰的麻辣鍋、清甜的白玉蘿蔔湯，還是酸甜苦辣全有的綜合拼盤？",
        "hint_cn": "是热气腾腾的麻辣锅、清甜的白玉萝卜汤，还是酸甜苦辣全有的综合拼盘？",
        "hint_en": "A sizzling hotpot, a comforting bowl of noodle soup, or an unpredictable sweet-and-sour stir fry?"
    },
    {
        "id": "fun_012",
        "question_tw": "如果外人只看我們在外面的樣子，他們會以為我們是誰說了算？但實際上家裡真正的大 Boss 是誰？",
        "question_cn": "如果外人只看我们在外面的样子，他们会以为我们是谁说了算？但实际上家里真正的大 Boss 是谁？",
        "question_en": "To outsiders observing us in public, who looks like they wear the pants? But who actually calls the shots at home?",
        "hint_tw": "大方揭開我們家裡的「權力結構真相」與反差！",
        "hint_cn": "大方揭开我们家里的“权力结构真相”与反差！",
        "hint_en": "Expose the real household hierarchy versus what we project to friends!"
    },
    {
        "id": "fun_013",
        "question_tw": "我穿哪一套衣服或哪種打扮時，在你眼裡看起來最好看、最讓你忍不住想多看兩眼？",
        "question_cn": "我穿哪一套衣服或哪种打扮时，在你眼里看起来最好看、最让你忍不住想多看两眼？",
        "question_en": "What specific outfit or aesthetic of mine makes you secretly swoon and stare whenever I wear it?",
        "hint_tw": "是正式西裝套裝、休閒居家服、還是剛運動完隨性的模樣？",
        "hint_cn": "是正式西装套装、休闲居家服、还是刚运动完随性的模样？",
        "hint_en": "Dressed to the nines, cozy oversized sweatpants, or casual post-workout glow?"
    },
    {
        "id": "fun_014",
        "question_tw": "我們之間有沒有哪個「只有我們兩個人聽得懂的內部梗或暗語」？是怎麼由來的？",
        "question_cn": "我们之间有没有哪个“只有我们两个人听得懂的内部梗或暗语”？是怎么由来的？",
        "question_en": "What private inside joke or secret code word exists only between the two of us, and what was its ridiculous origin?",
        "hint_tw": "高特曼研究證實：共同的內部語言是情侶極度親密的重要特徵。",
        "hint_cn": "高特曼研究证实：共同的内部语言是情侣极度亲密的重要特征。",
        "hint_en": "Gottman's research shows secret couple language is a prime marker of deep bondedness."
    },
    {
        "id": "fun_015",
        "question_tw": "如果可以不用考慮預算與責任，明天早上醒來我們立刻去機場飛往世界任一角落，你最想抓我去哪裡？",
        "question_cn": "如果可以不用考虑预算与责任，明天早上醒来我们立刻去机场飞往世界任一角落，你最想抓我去哪里？",
        "question_en": "If money and responsibilities vanished overnight and we woke up at the airport, where are you whisking me away to?",
        "hint_tw": "是北極看極光、冰島自駕、海島躺平，還是京都老街喝茶？",
        "hint_cn": "是北极看极光、冰岛自驾、海岛躺平，还是京都老街喝茶？",
        "hint_en": "Chasing the Northern Lights, a road trip in Iceland, lounging in Fiji, or wandering alleyways in Kyoto?"
    },
    {
        "id": "fun_016",
        "question_tw": "我有沒有哪一首一播出來我就會忍不住跟著大唱、或者忍不住跟著擺動身體的「洗腦愛歌」？",
        "question_cn": "我有没有哪一首一播出来我就会忍不住跟着大唱、或者忍不住跟着摆动身体的“洗脑爱歌”？",
        "question_en": "What is that one embarrassing guilty-pleasure song that instantly makes me sing along or bust out ridiculous dance moves?",
        "hint_tw": "模仿一下對方在車上或浴室裡忘情自嗨的搞笑樣子！",
        "hint_cn": "模仿一下对方在车上或浴室里忘情自嗨的搞笑样子！",
        "hint_en": "Imitate how your partner shamelessly rocks out in the car or shower!"
    },
    {
        "id": "fun_017",
        "question_tw": "如果你現在可以為我頒發一個「世界吉尼斯世界紀錄」，你覺得我能打破什麼項目的紀錄？",
        "question_cn": "如果你现在可以为我颁发一个“世界吉尼斯世界纪录”，你觉得我能打破什么项目的纪录？",
        "question_en": "If you could award me a Guinness World Record right now, what hilarious category would I definitely hold the crown in?",
        "hint_tw": "例如「最快把房間弄亂」、「找鑰匙最久」、「挑外送看菜單最糾結」等。",
        "hint_cn": "例如“最快把房间弄乱”、“找钥匙最久”、“挑外卖看菜单最纠结”等。",
        "hint_en": "Fastest room wrecker, longest time finding lost keys, or most indecisive menu browser?"
    },
    {
        "id": "fun_018",
        "question_tw": "在我們一起生活或約會的過程中，我做過哪件蠢事，讓你當下哭笑不得、甚至懷疑自己的眼光？",
        "question_cn": "在我们一起生活或约会的过程中，我做过哪件蠢事，让你当下哭笑不得、甚至怀疑自己的眼光？",
        "question_en": "What completely goofy or klutzy thing have I done that made you facepalm and wonder, 'Who did I pick?!'",
        "hint_tw": "笑著把那些糗事抖出來，這是最放鬆療癒的感情黏著劑。",
        "hint_cn": "笑着把那些糗事抖出来，这是最放松疗愈的感情粘着剂。",
        "hint_en": "Affectionately roasting each other's silliest moments cements real comfort."
    },
    {
        "id": "fun_019",
        "question_tw": "如果我們兩個去參加雙人綜藝闖關節目，你覺得我們會在「體能關卡」還是「默契問答」先崩潰？",
        "question_cn": "如果我们两个去参加双人综艺闯关节目，你觉得我们会在“体能关卡”还是“默契问答”先崩溃？",
        "question_en": "If we competed as a duo on a game show like The Amazing Race, would we implode during physical challenges or trivia coordination?",
        "hint_tw": "想像兩個人為了猜同一道題目或找地圖吵得不可開交的喜劇畫面！",
        "hint_cn": "想象两个人为了猜同一道题目或找地图吵得不可开交的喜剧画面！",
        "hint_en": "Picture the comedic disaster of us screaming over navigation clues or trivia answers!"
    },
    {
        "id": "fun_020",
        "question_tw": "你覺得我睡覺的時候有哪些不可告人的秘密？（例如磨牙、搶被子、說夢話、姿勢大開大合）？",
        "question_cn": "你觉得我睡觉的时候有哪些不可告人的秘密？（例如磨牙、抢被子、说梦话、姿势大开大合）？",
        "question_en": "What are my scandalous nighttime sleep habits? (e.g., snoring, stealing blankets, weird sleep-talking, octopus sprawls)?",
        "hint_tw": "同床共枕的真實日常，分享那些又氣又好笑的夜晚小細節。",
        "hint_cn": "同床共枕的真实日常，分享那些又气又好笑的夜晚小细节。",
        "hint_en": "The unglamorous realities of sharing a mattress—spill the funny nocturnal evidence."
    },
    {
        "id": "fun_021",
        "question_tw": "如果世界上所有的工作報酬都一樣高，你覺得我最適合去轉行做什麼稀奇古怪的職業？",
        "question_cn": "如果世界上所有的工作报酬都一样高，你觉得我最适合去转行做什么稀奇古怪的职业？",
        "question_en": "If every job in the world paid the exact same high wage, what whimsical, eccentric career should I pivot to?",
        "hint_tw": "熊貓保育員、咖啡店試吃員、專業發呆大師，還是古董鑑賞家？",
        "hint_cn": "熊猫保育员、咖啡店试吃员、专业发呆大师，还是古董鉴赏家？",
        "hint_en": "Panda snuggler, bed tester, professional napper, or artisanal coffee taster?"
    },
    {
        "id": "fun_022",
        "question_tw": "我們兩個人在一起時，做過最無聊、最廢物、但你卻覺得特別幸福的一件事是什麼？",
        "question_cn": "我们两个人在一起时，做过最无聊、最废物、但你却觉得特别幸福的一件事是什么？",
        "question_en": "What is the most completely unproductive, lazy thing we've done together that still felt wonderfully wholesome?",
        "hint_tw": "躺在沙發上一整天刷廢片、在床上無意義地滾來滾去、或是吃同一桶冰淇淋看爛片。",
        "hint_cn": "躺在沙发上一整天刷废片、在床上无意义地滚来滚去、或是吃同一桶冰淇淋看烂片。",
        "hint_en": "Rotting on the couch binge-watching trash TV, doomscrolling together, or sharing ice cream in bed."
    },
    {
        "id": "fun_023",
        "question_tw": "如果我們要為我們這個家訂立一條「絕對荒謬但必須嚴格遵守的奇葩家規」，你希望是什麼？",
        "question_cn": "如果我们要为我们这个家订立一条“绝对荒谬但必须严格遵守的奇葩家规”，你希望是什么？",
        "question_en": "If we had to establish one completely absurd household rule that both of us must strictly obey, what would it be?",
        "hint_tw": "例如：進門前必須跳一段奇怪的舞、吵架時必須用唐老鴨聲音講話等。",
        "hint_cn": "例如：进门前必须跳一段奇怪的舞、吵架时必须用唐老鸭声音讲话等。",
        "hint_en": "E.g., doing a goofy dance before opening the fridge, or speaking in a Donald Duck voice when annoyed."
    },
    {
        "id": "fun_024",
        "question_tw": "在你看來，如果拍一部關於我們倆愛情故事的電影，你覺得應該屬於什麼類型？誰來演我們？",
        "question_cn": "在你看来，如果拍一部关于我们俩爱情故事的电影，你觉得应该属于什么类型？谁来演我们？",
        "question_en": "If Hollywood made a movie about our relationship, what genre would it be, and which actors would play us?",
        "hint_tw": "是無厘頭浪漫喜劇、懸疑驚悚片、還是溫馨公路電影？",
        "hint_cn": "是无厘头浪漫喜剧、悬疑惊悚片、还是温馨公路电影？",
        "hint_en": "Slapstick rom-com, psychological thriller, indie art-house drama, or buddy cop chaos?"
    },
    {
        "id": "fun_025",
        "question_tw": "我有哪一種「食物地雷」或者「莫名奇妙的飲食堅持」，是你到現在都覺得難以理解的？",
        "question_cn": "我有没有哪一种“食物地雷”或者“莫名其妙的饮食坚持”，是你到现在都觉得难以理解的？",
        "question_en": "What is a food aversion or bizarre culinary obsession of mine that baffles you to this day?",
        "hint_tw": "香菜、皮蛋、吃東西不能混在一起、還是炸雞一定要先去皮？",
        "hint_cn": "香菜、皮蛋、吃东西不能混在一起、还是炸鸡一定要先去皮？",
        "hint_en": "Cilantro hatred, food touching on the plate, peeling fried chicken skin, or odd dipping rituals?"
    },
    {
        "id": "fun_026",
        "question_tw": "當我心情極差或者生悶氣時，哪一種「食物或賄賂方式」對我最管用，能最快讓我消氣？",
        "question_cn": "当我心情极差或者生闷气时，哪一种“食物或贿赂方式”对我最管用，能最快让我消气？",
        "question_en": "When I am sulking or in a terrible mood, what treat or bribery tactic works best to instantly melt my frost?",
        "hint_tw": "一杯半糖微冰珍奶、鹽酥雞、巧克力，還是直接塞一個紅包？",
        "hint_cn": "一杯半糖微冰珍奶、炸鸡、巧克力，还是直接塞一个红包？",
        "hint_en": "Boba tea, crispy fried chicken, chocolate brownies, or a strategic forehead kiss?"
    },
    {
        "id": "fun_027",
        "question_tw": "如果我現在突然被縮小成一隻倉鼠那麼大，你會怎麼照顧我？你會帶我去哪裡炫耀？",
        "question_cn": "如果我现在突然被缩小成一只仓鼠那么大，你会怎么照顾我？你会带我去哪里炫耀？",
        "question_en": "If I magically shrunk into the size of a little pocket hamster, how would you care for me and where would you show me off?",
        "hint_tw": "把我放在口袋裡隨身帶著上班，還是給我蓋一座豪華樂高豪宅？",
        "hint_cn": "把我放在口袋里随身带着上班，还是给我盖一座豪华乐高豪宅？",
        "hint_en": "Carry me in your front shirt pocket all day or build me a luxury Lego mansion?"
    },
    {
        "id": "fun_028",
        "question_tw": "在我們相處中，你覺得我的哪一個「肢體語言或小動作」最可愛，最讓你忍不住想摸摸我的頭？",
        "question_cn": "在我们相处中，你觉得我的哪一个“肢体语言或小动作”最可爱，最让你忍不住想摸摸我的头？",
        "question_en": "What physical gesture or unconscious movement of mine do you find utterly adorable and make you want to pat my head?",
        "hint_tw": "揉眼睛、抓頭髮、笑到眼睛瞇成一條線、還是縮成一團的樣子？",
        "hint_cn": "揉眼睛、抓头发、笑到眼睛眯成一条线、还是缩成一团的样子？",
        "hint_en": "Rubbing eyes when sleepy, hair-tucking, crinkling nose when laughing, or curling into a ball?"
    },
    {
        "id": "fun_029",
        "question_tw": "如果我們中了 1 億元頭獎彩券，第一天晚上我們要在哪裡狂歡？買的第一個「沒用但好玩」的東西是什麼？",
        "question_cn": "如果我们中了 1 亿元头奖彩票，第一天晚上我们要在哪里狂欢？买的第一个“没用但好玩”的东西是什么？",
        "question_en": "If we won a \$10 million lottery jackpot, where are we partying on night one? What's the first useless luxury item we buy?",
        "hint_tw": "不用理智規劃，純粹釋放最狂野好笑的白日夢！",
        "hint_cn": "不用理智规划，纯粹释放最狂野好笑的白日梦！",
        "hint_en": "Drop sensible budgeting—what is the most outrageously fun daydream indulgence?"
    },
    {
        "id": "fun_030",
        "question_tw": "如果可以把我大腦裡的某一個「缺點或 Bug」一鍵修復，你最想修復哪一個？（修復完就不像我了喔！）",
        "question_cn": "如果可以把我大脑里的某一个“缺点或 Bug”一键修复，你最想修复哪一个？（修复完就不像我了喔！）",
        "question_en": "If you could debug one harmless glitch in my brain with a magic patch, what would it be? (Careful, it makes me who I am!)",
        "hint_tw": "丟三落四、路痴導航、記錯日期、還是偶爾斷線的邏輯？",
        "hint_cn": "丢三落四、路痴导航、记错日期、还是偶尔断线的逻辑？",
        "hint_en": "Misplacing keys, terrible sense of direction, forgetting dates, or funny short-circuits?"
    },
    {
        "id": "fun_031",
        "question_tw": "如果我們被要求一起參加情侶雙人跳傘，你覺得在跳出機艙的那一秒，誰會尖叫得最慘烈？",
        "question_cn": "如果我们被要求一起参加情侣双人跳伞，你觉得在跳出机舱的那一秒，谁会尖叫得最惨烈？",
        "question_en": "If we went skydiving together, who would let out the most ungodly, high-pitched scream the second we stepped out the door?",
        "hint_tw": "誠實面對我們兩個人的膽量天花板！",
        "hint_cn": "诚实面对我们两个人的胆量天花板！",
        "hint_en": "Honest assessment of who actually possesses nerves of steel!"
    },
    {
        "id": "fun_032",
        "question_tw": "你覺得我什麼時候最性感迷人？是認真專注工作的時候，還是剛洗完澡散發香氣的時候？",
        "question_cn": "你觉得我什么时候最性感迷人？是认真专注工作的时候，还是刚洗完澡散发香气的时候？",
        "question_en": "When do I look most irresistible and attractive to you? Deep in hyper-focused work, or freshly showered and relaxed?",
        "hint_tw": "日常陪伴中的致命吸引力時刻，不吝嗇給予伴侶熱烈的心動回饋！",
        "hint_cn": "日常陪伴中的致命吸引力时刻，不吝啬给予伴侣热烈的心动反馈！",
        "hint_en": "Daily sparks of attraction: lavish your partner with genuine flattery!"
    },
    {
        "id": "fun_033",
        "question_tw": "如果我們兩個人必須穿著一模一樣的情侶裝走在東區或西門町街頭，你最不能接受的款式是什麼？",
        "question_cn": "如果我们两个人必须穿着一模一样的情侣装走在最热闹的商业街头，你最不能接受的款式是什么？",
        "question_en": "If we were forced to walk down a crowded trendy street in matching couple outfits, what design would be your worst nightmare?",
        "hint_tw": "印著彼此超大頭像的 T 恤、全身亮黃色緊身衣、還是卡通連身睡衣？",
        "hint_cn": "印着彼此超大头像的 T 恤、全身亮黄色紧身衣、还是卡通连体睡衣？",
        "hint_en": "Massive airbrushed portraits of each other's faces, neon spandex, or giant onesies?"
    },
    {
        "id": "fun_034",
        "question_tw": "如果給你一次機會「點餐」：明天整整一天，我必須無條件聽從你的所有合理指令，你最想指使我做什麼？",
        "question_cn": "如果给你一次机会“点餐”：明天整整一天，我必须无条件听从你的所有合理指令，你最想指使我做什么？",
        "question_en": "If you had a 'One-Day Royalty Pass' where I had to obey all your reasonable commands, what would you make me do all day?",
        "hint_tw": "全天候肩膀按摩、泡茶伺候、包辦所有家事，還是陪你玩一整天遊戲？",
        "hint_cn": "全天候肩膀按摩、泡茶伺候、包办所有家事，还是陪你玩一整天游戏？",
        "hint_en": "Endless foot rubs, serving breakfast in bed, doing all chores, or playing your favorite game?"
    },
    {
        "id": "fun_035",
        "question_tw": "如果我們兩個吵架的時候被規定不能說話，只能用「畫畫」或「跳舞」來溝通，場面會變成怎樣？",
        "question_cn": "如果我们两个吵架的时候被规定不能说话，只能用“画画”或“跳舞”来沟通，场面会变成怎样？",
        "question_en": "If we were forbidden from speaking during a fight and had to communicate solely through drawings or dance, what would that look like?",
        "hint_tw": "想像那個生氣卻又不得不手舞足蹈的荒唐場面！",
        "hint_cn": "想象那个生气却又不得不手舞足蹈的荒唐场面！",
        "hint_en": "Picture the sheer absurdity of furious interpretive dancing or stick figure battle drawings!"
    },
    {
        "id": "fun_036",
        "question_tw": "我有哪一個只有你見識過的「魔性笑聲」或「打噴嚏聲音」？每次出現都讓你印象深刻？",
        "question_cn": "我有没有哪一个只有你见识过的“魔性笑声”或“打喷嚏声音”？每次出现都让你印象深刻？",
        "question_en": "What is my true, unfiltered laugh or sneeze like when I completely drop all social etiquette around you?",
        "hint_tw": "笑到發出小豬叫、海豚音、或是震天動地的打噴嚏！現場模仿一下！",
        "hint_cn": "笑到发出小猪叫、海豚音、或是震天动地的打喷嚏！现场模仿一下！",
        "hint_en": "Snorting, wheezing, high-pitch squeaks, or earth-shattering sneezes! Reenact it!"
    },
    {
        "id": "fun_037",
        "question_tw": "如果我們家裡養了一隻聰明的鸚鵡，你最害怕牠把我們平日在家裡的哪句話學起來講給客人聽？",
        "question_cn": "如果我们家里养了一只聪明的鹦鹉，你最害怕它把我们平日在家里的哪句话学起来讲给客人听？",
        "question_en": "If we owned a talkative parrot, what daily household catchphrase would you be most mortified for it to repeat to guests?",
        "hint_tw": "那些肉麻兮兮的疊字撒嬌、互嗆的口頭禪，還是叫對方去倒垃圾的碎碎念？",
        "hint_cn": "那些肉麻兮兮的叠字撒娇、互呛的口头禅，还是叫对方去倒垃圾的碎碎念？",
        "hint_en": "Baby talk, ridiculous banter nicknames, or nagging each other to take out the trash?"
    },
    {
        "id": "fun_038",
        "question_tw": "如果我們倆要一起開一家店，不管是咖啡廳、酒吧還是二手書店，你覺得店名叫什麼最能代表我們？",
        "question_cn": "如果我们俩要一起开一家店，不管是咖啡厅、酒吧还是二手书店，你觉得店名叫什么最能代表我们？",
        "question_en": "If we opened a cozy shop together—a cafe, dive bar, or vintage bookstore—what name would perfectly capture our vibe?",
        "hint_tw": "結合兩個人的名字、共同愛好或某個難忘回憶的幽默命名。",
        "hint_cn": "结合两个人的名字、共同爱好或某个难忘回忆的幽默命名。",
        "hint_en": "Blend our names, our shared obsession, or an unforgettable funny memory."
    },
    {
        "id": "fun_039",
        "question_tw": "你覺得我們兩個人在生活自理能力上，誰更像是個「生活白痴」？哪件事最能作為鐵證？",
        "question_cn": "你觉得我们两个人在这生活自理能力上，谁更像是个“生活白痴”？哪件事最能作为铁证？",
        "question_en": "Between the two of us, who is more of a domestic klutz? What incident serves as indisputable evidence?",
        "hint_tw": "煮菜差點燒掉廚房、組裝 IKEA 家具多出一堆螺絲、還是洗衣服把衣服全染色？",
        "hint_cn": "煮菜差点烧掉厨房、组装 IKEA 家具多出一堆螺丝、还是洗衣服把衣服全染色？",
        "hint_en": "Almost burning down the kitchen, assembling IKEA furniture backwards, or turning laundry pink?"
    },
    {
        "id": "fun_040",
        "question_tw": "如果外星人降臨地球，要求挑選我們其中一人作為人類樣本帶走，你覺得外星人會挑誰？為什麼？",
        "question_cn": "如果外星人降临地球，要求挑选我们其中一人作为人类样本带走，你觉得外星人会挑谁？为什么？",
        "question_en": "If aliens abducted one of us as a representative sample of humanity, which one would they choose and why?",
        "hint_tw": "誰的行為舉止更具有「地球人類典型迷惑行為」的代表性？",
        "hint_cn": "谁的行为举止更具有“地球人类典型迷惑行为”的代表性？",
        "hint_en": "Whose bizarre daily habits would provide aliens with the most fascinating human case study?"
    },
    {
        "id": "fun_041",
        "question_tw": "在你看來，如果我們兩個一起變老到 80 歲，我們會是怎樣的一對「老頑童」夫妻？",
        "question_cn": "在你看来，如果我们两个一起变老到 80 岁，我们会是怎样的一对“老顽童”夫妻？",
        "question_en": "When we are 80 years old, what kind of mischievous, lovable old couple will we be?",
        "hint_tw": "想像我們坐著電動輪椅飆車、在公園跟年輕人搶下棋，還是每天互相鬥嘴的模樣！",
        "hint_cn": "想象我们坐着电动轮椅飙车、在公园跟年轻人抢下棋，还是每天互相斗嘴的模样！",
        "hint_en": "Racing mobility scooters, bickering affectionately over morning tea, or causing trouble in the park!"
    },
    {
        "id": "fun_042",
        "question_tw": "我有沒有哪一個「你完全無法理解但又只能寵溺接受」的冷門嗜好或收藏癖好？",
        "question_cn": "我有没有哪一个“你完全无法理解但又只能宠溺接受”的冷门嗜好或收藏癖好？",
        "question_en": "What niche, odd hobby or collecting obsession of mine do you completely not understand, yet tolerate with affection?",
        "hint_tw": "收集盲盒、留著不用的紙袋、買奇怪的電子小配件、或是沉迷某種奇怪遊戲？",
        "hint_cn": "收集盲盒、留着不用的纸袋、买奇怪的电子小配件、或是沉迷某种奇怪游戏？",
        "hint_en": "Hoarding pretty shopping bags, buying obscure gadgets, collecting figurines, or niche mobile games?"
    },
    {
        "id": "fun_043",
        "question_tw": "如果我們現在被關在一間完全沒有網路、沒有手機的房間裡 48 小時，我們該怎麼打發時間才不會無聊死？",
        "question_cn": "如果我们现在被关在一间完全没有网络、没有手机的房间里 48 小时，我们该怎么打发时间才不会无聊死？",
        "question_en": "If we were locked in an empty room with zero Wi-Fi and no phones for 48 hours, how would we survive without dying of boredom?",
        "hint_tw": "徹夜聊天、互相按摩、玩猜謎遊戲，還是補眠睡上整整兩天？",
        "hint_cn": "彻夜聊天、互相按摩、玩猜谜游戏，还是补眠睡上整整两天？",
        "hint_en": "Talking until sunrise, giving massages, invented word games, or catching up on 40 hours of sleep?"
    },
    {
        "id": "fun_044",
        "question_tw": "在我們一起看電影或追劇的時候，我做過哪種行為最讓你受不了？（例如瘋狂爆雷、一直問劇情、還是看五分鐘就睡著）？",
        "question_cn": "在我们一起看电影或追剧的时候，我做过哪种行为最让你受不了？（例如疯狂剧透、一直问剧情、还是看五分钟就睡着）？",
        "question_en": "When watching movies together, what habit of mine drives you nuts? (Spoiling plots, constantly asking who that is, or falling asleep within 5 minutes)?",
        "hint_tw": "大膽吐槽沙發上的觀影日常！",
        "hint_cn": "大胆吐槽沙发上的观影日常！",
        "hint_en": "Unapologetically call out couch movie etiquette!"
    },
    {
        "id": "fun_045",
        "question_tw": "如果可以讓你給我重新起一個「專屬私房小暱稱」，而且我不能抗議，你想叫我什麼？",
        "question_cn": "如果可以让你给我重新起一个“专属私房小昵称”，而且我不能抗议，你想叫我什么？",
        "question_en": "If you could re-christen me with a new private, ridiculous pet name that I was legally bound to answer to, what would it be?",
        "hint_tw": "越幼稚肉麻越好，看看誰能挑戰恥度極限！",
        "hint_cn": "越幼稚肉麻越好，看看谁能挑战耻度极限！",
        "hint_en": "The more shamelessly goofy or sweet, the better!"
    },
    {
        "id": "fun_046",
        "question_tw": "如果我們兩個人一起去參加萬聖節變裝派對，你最想把我們打扮成什麼搞笑又搶眼的組合？",
        "question_cn": "如果我们两个人一起去参加万圣节变装派对，你最想把我们打扮成什么搞笑又抢眼的组合？",
        "question_en": "If we went to a Halloween costume party as a couple, what hilarious or iconic duo should we dress up as?",
        "hint_tw": "史瑞克與費歐娜、胡迪與巴斯光年、還是番茄醬與芥末醬？",
        "hint_cn": "史瑞克与费欧娜、胡迪与巴斯光年、还是番茄酱与芥末酱？",
        "hint_en": "Shrek & Fiona, Ketchup & Mustard, Barbie & Ken, or Rick & Morty?"
    },
    {
        "id": "fun_047",
        "question_tw": "你覺得我什麼時候最像隻「驕傲的小孔雀」？那時候我做成了什麼事、整個人得意洋洋的？",
        "question_cn": "你觉得我什么时候最像只“骄傲的小孔雀”？那时候我做成了什么事、整个人得意洋洋的？",
        "question_en": "When do I strut around looking like a proud little peacock? What accomplishment had me totally beaming with pride?",
        "hint_tw": "修好電器、煮出一道美味大餐、還是搶到便宜的機票？",
        "hint_cn": "修好电器、煮出一道美味大餐、还是抢到便宜的机票？",
        "hint_en": "Fixing a leaky pipe, cooking a gourmet dinner, or finding the absolute cheapest flight deal?"
    },
    {
        "id": "fun_048",
        "question_tw": "在我們一起出門逛街時，我最容易在哪個專櫃或商品區像被「吸塵器吸住」一樣走不動路？",
        "question_cn": "在我们一起出门逛街时，我最容易在哪个专柜或商品区像被“吸尘器吸住”一样走不动路？",
        "question_en": "When we go shopping together, which specific aisle or store turns on a tractor beam that I cannot physically walk away from?",
        "hint_tw": "書店文具區、3C 電子配件、甜點櫃、還是寵物用品區？",
        "hint_cn": "书店文具区、3C 电子配件、甜点柜、还是宠物用品区？",
        "hint_en": "Stationery stores, tech gadget alleys, pastry bakery displays, or pet toy sections?"
    },
    {
        "id": "fun_049",
        "question_tw": "如果我們兩個人的默契程度是一首合唱歌曲，你覺得現在是「天衣無縫的神仙合音」還是「偶爾破音的卡拉OK」？",
        "question_cn": "如果我们两个人的默契程度是一首合唱歌曲，你觉得现在是“天衣无缝的神仙合音”还是“偶尔破音的卡拉OK”？",
        "question_en": "If our chemistry were a duet, are we harmonizing like Grammy-winning legends, or screaming off-key at 2 AM karaoke?",
        "hint_tw": "即使走音破音也充滿歡笑，這才是最真實舒服的生活調調。",
        "hint_cn": "即使走音破音也充满欢笑，这才是最真实舒服的生活调调。",
        "hint_en": "Even with hilarious off-key cracks, genuine joy makes it the sweetest tune."
    },
    {
        "id": "fun_050",
        "question_tw": "現在看著對方的臉 10 秒鐘，不准說話，誰先忍不住笑出來，誰明天早上就要負責泡咖啡或做早餐！",
        "question_cn": "现在看着对方的脸 10 秒钟，不准说话，谁先忍不住笑出来，谁明天早上就要负责泡咖啡或做早餐！",
        "question_en": "Stare directly into each other's eyes for 10 silent seconds without speaking—first one to crack up makes breakfast tomorrow!",
        "hint_tw": "倒數 3、2、1……開始對視！看誰先破功！",
        "hint_cn": "倒数 3、2、1……开始对视！看谁先破功！",
        "hint_en": "3, 2, 1... eyes locked! Let's see who breaks first!"
    }
]
