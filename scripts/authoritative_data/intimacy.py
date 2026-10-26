# -*- coding: utf-8 -*-
"""
Category: intimacy (親密與連結 / Intimacy & Connection)
Authoritative Sources:
- Esther Perel: Where Should We Begin? (Eroticism, Play, Intimacy)
- We're Not Really Strangers (WNRS): Level 3 Reflection
- Dr. Sue Johnson: Hold Me Tight (Emotionally Focused Therapy - Attachment)
- Arthur Aron: Interpersonal Closeness Generating Prompts
"""

INTIMACY_QUESTIONS = [
    {
        "tw": "我最近做過哪一件微小具體的事，讓你在那一瞬間深刻感受到『我是被這個人深愛著的』？",
        "cn": "我最近做过哪一件微小具体的事，让你在那一瞬间深刻感受到“我是被这个人深爱着的”？",
        "en": "What small, specific action did I take recently that made you feel deeply, unquestionably cherished in that exact second?"
    },
    {
        "tw": "當你在外面被生活折騰得身心俱疲回到家時，你最渴望我用什麼方式對待你？（緊緊擁抱、安靜陪伴，還是先完全不要打擾你？）",
        "cn": "当你在外面被生活折腾得身心俱疲回到家时，你最渴望我用什么方式对待你？（紧紧拥抱、安静陪伴，还是先完全不要打扰你？）",
        "en": "When you return home utterly wrung out by life, what reception heals you: a fierce silent hug, gentle tea and quiet, or total space?"
    },
    {
        "tw": "在我們相處的記憶裡，哪一次我們之間的眼神交會或觸碰，讓你心動到現在都還記得那一秒的溫度？",
        "cn": "在我们相处的记忆里，哪一次我们之间的眼神交会或触碰，让你心动到现在都还记得那一秒的温度？",
        "en": "Was there a specific look or brush of skin between us whose electric warmth is still vivid in your body's memory?"
    },
    {
        "tw": "在你看來，真正高質量的『兩人世界』是怎樣的一種狀態？我們最近多久沒有體會過這種狀態了？",
        "cn": "在你看来，真正高质量的“两人世界”是怎样的一种状态？我们最近多久没有体会过这种状态了？",
        "en": "How do you define true 'high-quality intimacy' where external noise dissolves, and when was the last time we bathed in that space?"
    },
    {
        "tw": "當你在感情中感到吃醋或不安時，你的本能反應通常是冷嘲熱諷、故意冷淡，還是會主動撒嬌求安慰？",
        "cn": "当你在感情中感到吃醋或不安时，你的本能反应通常是冷嘲热讽、故意冷淡，还是会主动撒娇求安慰？",
        "en": "When a wave of jealousy or insecurity hits you, does your body weaponize cold sarcasm, retreat into silence, or soften into seeking reassurance?"
    },
    {
        "tw": "你覺得在我身上，哪一個特質最初吸引了你，而哪一個特質是隨著相處日久才讓你越來越著迷的？",
        "cn": "你觉得在我身上，哪一个特质最初吸引了你，而哪一个特质是随着相处日久才让你越来越着迷的？",
        "en": "What magnetic trait originally drew you across the room, and what deeper nuance of my character have you fallen for only after months together?"
    },
    {
        "tw": "在我們兩人的親密相處中，你覺得我們目前最需要找回或點燃的是什麼樣的感覺？",
        "cn": "在我们两人的亲密相处中，你觉得我们目前最需要找回或点燃的是什么样的感觉？",
        "en": "In our current season together, what flavor of connection are we starving for: playful curiosity, sensual tenderness, or raw adventure?"
    },
    {
        "tw": "當你對我展露你最不體面、最狼狽的一面時，你心底最害怕看見我的眼神裡流露出一種怎樣的神情？",
        "cn": "当你对我展露你最不体面、最狼狈的一面时，你心底最害怕看见我的眼神里流露出一种怎样的神情？",
        "en": "When exposing your messiest, least flattering state, what dreaded flicker in my eyes do you fear most: disgust, pity, or judgment?"
    },
    {
        "tw": "回想我們剛認識或剛交往時，哪一個特定的約會瞬間讓你突然確信『這輩子就是這個人了』？",
        "cn": "回想我们刚认识或刚交往时，哪一个特定的约会瞬间让你突然确信“这辈子就是这个人了”？",
        "en": "Back in our earliest dating days, what fleeting instant struck like lightning and told you: 'This is the person I want to hold'?"
    },
    {
        "tw": "如果用三個詞來形容我們相擁入睡時你感受到的氛圍，你會選哪三個詞？",
        "cn": "如果用三个词来形容我们相拥入睡时你感受到的氛围，你会选哪三个词？",
        "en": "What three words capture the sensory atmosphere when we are tangled together drifting off to sleep?"
    },
    {
        "tw": "在日常生活中，當我做出哪一個不經意的小動作時，會讓你忍不住多看我幾眼、覺得特別迷人？",
        "cn": "在日常生活中，当我做出哪一个不经意的小动作时，会让你忍不住多看我几眼、觉得特别迷人？",
        "en": "What completely unconscious mannerism of mine reliably catches your eye and makes you quietly think: 'God, they are gorgeous'?"
    },
    {
        "tw": "回想我們最近一次牽手，你更喜歡十指緊扣的扎實感，還是輕輕搭著掌心的溫柔隨意？",
        "cn": "回想我们最近一次牵手，你更喜欢十指紧扣的扎实感，还是轻轻搭着掌心的温柔随意？",
        "en": "When we walk hand-in-hand, do you crave the grounded weight of interlocked fingers, or a light, playful caress of palms?"
    },
    {
        "tw": "在蓋瑞·巧 Chapman 提出的五種愛的語言（肯定的言語、服務的行動、真心的禮物、精心的時刻、身體的接觸）中，哪一種最能直接填滿你的情感存摺？",
        "cn": "在盖瑞·巧 Chapman 提出的五种爱的语言（肯定的言语、服务的行动、真心的礼物、精心的时刻、身体的接触）中，哪一种最能直接填满你的情感存折？",
        "en": "Among the Five Love Languages (Words, Acts, Gifts, Quality Time, Physical Touch), which one deposits immediate emotional wealth into your soul?"
    },
    {
        "tw": "有沒有哪一次我為你準備的小驚喜或貼心舉動，即便事隔很久，依然是你心底最溫暖的一處避風港？",
        "cn": "有没有哪一次我为你准备的小惊喜或贴心举动，即便事隔很久，依然是你心底最温暖的一处避风港？",
        "en": "What unexpected gesture or thoughtful care from me remains a permanent warm fire in your memories?"
    },
    {
        "tw": "在你看來，『親密感（Intimacy）』是否只有在臥室裡才成立？日常對話中哪種交流能帶給你同等強烈的親密感？",
        "cn": "在你看来，“亲密感（Intimacy）”是否只有在卧室里才成立？日常对话中哪种交流能带给你同等强烈的亲密感？",
        "en": "Does true intimacy live only in the bedroom, or does sharing raw, unfiltered truth over a late-night cup of tea rival it completely?"
    },
    {
        "tw": "當我們兩個人並肩走在街頭時，什麼樣的小默契會讓你在人群中突然感受到一股強烈的歸屬感？",
        "cn": "当我们两个人并肩走在街头时，什么样的小默契会让你在人群中突然感受到一股强烈的归属感？",
        "en": "When moving side-by-side through a crowded street, what tiny silent gesture between us makes the rest of the world fade away?"
    },
    {
        "tw": "你最喜歡我用怎樣的稱呼或語氣在私底下叫你？那會讓你感到被寵溺還是被渴望？",
        "cn": "你最喜欢我用怎样的称呼或语气在私底下叫你？那会让你感到被宠溺还是被渴望？",
        "en": "What private nickname or inflection in my voice unlocks that sweet, involuntary blush in your heart?"
    },
    {
        "tw": "在我們兩人的相處模式中，哪一種肢體接觸（如摸摸頭、捏後頸、撫摸背部）最能讓你瞬間卸下防備？",
        "cn": "在我们两人的相处模式中，哪一种肢体接触（如摸摸头、捏后颈、抚摸背部）最能让你瞬间卸下防备？",
        "en": "Which physical touch—fingers through your hair, a hand on the small of your back, or a gentle neck squeeze—instantly dissolves tension?"
    },
    {
        "tw": "如果今天晚上沒有任何手機、電視與代辦事項打擾，你最想和我躺在沙發上一邊喝著熱飲一邊聊些什麼？",
        "cn": "如果今天晚上没有任何手机、电视与代办事项打扰，你最想和我躺在沙发上一边喝着热饮一边聊些什么？",
        "en": "If every digital screen vanished for one evening, what sprawling, unhurried topic would you love to get lost discussing with me?"
    },
    {
        "tw": "在你看來，『被愛』與『被理解』這兩件事，哪一個對你而言更難得、更讓你動容？",
        "cn": "在你看来，“被爱”与“被理解”这两件事，哪一个对你而言更难得、更让你动容？",
        "en": "Between 'being unconditionally adored' and 'being acutely, accurately understood,' which one is rarer and moves your soul more?"
    },
    {
        "tw": "回想我們熱戀期時做過最瘋狂或最浪漫的一件事，如果現在要挑一天完全重演，你會想重回哪一天？",
        "cn": "回想我们热恋期时做过最疯狂或最浪漫的一件事，如果现在要挑一天完全重演，你会想重回哪一天？",
        "en": "Looking back at the sweetest madness of our honeymoon phase, which single 24-hour day would you happily relive frame-by-frame?"
    },
    {
        "tw": "在我們相擁時，你有沒有注意過我們心跳或呼吸同頻的瞬間？那樣的時刻會帶給你怎樣的踏實感？",
        "cn": "在我们相拥时，你有没有注意过我们心跳或呼吸同频的瞬间？那样的时刻会带给你怎样的踏实感？",
        "en": "Have you ever synchronized your breathing against my chest until our hearts beat in unison? What does that quiet stillness say to you?"
    },
    {
        "tw": "當你看見我穿上哪一套衣服或是怎樣的打扮時，會讓你忍不住多盯著我看好幾秒、在心裡暗暗讚嘆？",
        "cn": "当你看见我穿上哪一套衣服或是怎样的打扮时，会让你忍不住多盯着我看好几秒、在心里暗暗赞叹？",
        "en": "What specific outfit, style, or disheveled morning look of mine makes you stare a little longer with private desire?"
    },
    {
        "tw": "在你看來，伴侶之間最迷人的浪漫，是刻意營造的花束與大餐，還是日復一日清晨為你留的那一杯溫開水？",
        "cn": "在你看来，伴侣之间最迷人的浪漫，是刻意营造的花束与大餐，还是日复一日清晨为你留的那一杯温开水？",
        "en": "Is real romance found in grand bouquets and candlelit reservations, or in the quiet loyalty of a pre-warmed mug placed beside your bed?"
    },
    {
        "tw": "你有沒有哪一次看著我在專心致志做某件事時，突然在心底湧起一股強烈想要從身後抱住我的衝動？那時我在做什麼？",
        "cn": "你有没有哪一次看着我在专心致志做某件事时，突然在心底涌起一股强烈想要从身后抱住我的冲动？那时我在做什么？",
        "en": "When have you caught me totally lost in deep focus, only to feel an overwhelming impulse to wrap your arms around me from behind?"
    },
    {
        "tw": "在我們兩人的感情旅程中，哪一個平淡的午後或早晨，反而成為了你心目中最幸福的代表畫面？",
        "cn": "在我们两人的感情旅程中，哪一个平淡的午后或早晨，反而成为了你心目中最幸福的代表画面？",
        "en": "What entirely uneventful Sunday morning or lazy rainy afternoon stands out in your mind as the absolute peak of human happiness?"
    },
    {
        "tw": "如果用一種香氣或氣味來代表我給你的安全感，你會形容那是怎樣的氣味？（陽光、曬過的被子、木質香還是咖啡？）",
        "cn": "如果用一种香气或气味来代表我给你的安全感，你会形容那是怎样的气味？（阳光、晒过的被子、木质香还是咖啡？）",
        "en": "If my safety in your life possessed an elemental scent, is it fresh cedar, sun-drenched linen, warm rain, or roasted coffee?"
    },
    {
        "tw": "當我們出遠門旅行、睡在陌生的飯店房間時，只要有我在身邊，你會覺得那裡就是家嗎？",
        "cn": "当我们出远门旅行、睡在陌生的饭店房间时，只要有我在身边，你会觉得那里就是家吗？",
        "en": "When waking in an unfamiliar hotel room in a foreign city, does turning over to see me immediately turn that stranger space into home?"
    },
    {
        "tw": "在我們這段關係裡，你最感謝我願意為你保留哪一部分的任性或孩子氣？",
        "cn": "在这段关系里，你最感谢我愿意为你保留哪一部分的任性或孩子气？",
        "en": "What playful, silly, or childish quirk of yours do you cherish that I never shame, but celebrate with warmth?"
    },
    {
        "tw": "如果今晚我們要重新溫習當初剛在一起時的心跳感，你最希望我們一起做一件什麼樣的浪漫小事？",
        "cn": "如果今晚我们要重新温习当初刚在一起时的心跳感，你最希望我们一起做一件什么样的浪漫小事？",
        "en": "If we decided to hijack tonight to intentionally reignite our first-date butterflies, what nostalgic adventure would we embark upon?"
    },
    {
        "tw": "在你看來，長久相處的伴侶要保持吸引力，最核心的秘訣是保有神秘感，還是彼此完全透明赤誠？",
        "cn": "在你看来，长久相处的伴侣要保持吸引力，最核心的秘诀是保有神秘感，还是彼此完全透明赤诚？",
        "en": "To keep lifelong desire alive, is the secret weapon maintaining a garden of personal mystery, or diving into total transparency?"
    },
    {
        "tw": "回想我們最近一次並肩坐在沙發上看電影或聊天，那時你的身體重心是自然靠向我，還是保持著距離？",
        "cn": "回想我们最近一次并肩坐在沙发上看电影或聊天，那时你的身体重心是自然靠向我，还是保持着距离？",
        "en": "When we collapse onto the couch, does your physical gravity naturally tilt into my shoulder, or do you notice a protective buffer?"
    },
    {
        "tw": "當你偶爾感到不安、懷疑自己是否依然對我有吸引力時，我的一句什麼話或怎樣的舉動能讓你瞬間安心？",
        "cn": "当你偶尔感到不安、怀疑自己是否依然对我有吸引力时，我的一句话或怎样的举动能让你瞬间安心？",
        "en": "If a quiet insecurity whispers that you've lost your allure to me, what exact touch or word banishes that lie in an instant?"
    },
    {
        "tw": "在你看來，我們兩個人在肢體接觸的頻率與偏好上，目前的步調是完美契合，還是你心裡渴望更多溫存？",
        "cn": "在你看来，我们两个人肢体接触的频率与偏好上，目前的步调是完美契合，还是你心里渴望更多温存？",
        "en": "Regarding simple everyday affection and tender touch, is our current rhythm fully aligned, or does your skin ache for more holding?"
    },
    {
        "tw": "你有沒有哪個專屬於我們兩人的小暗號，是只要我們在聚會場合偷偷對上眼神，彼此立刻心領神會的？",
        "cn": "你有没有哪个专属于我们两人间的小暗号，是只要我们在聚会场合偷偷对上眼神，彼此立刻心领神会的？",
        "en": "What is our best unspoken secret code across a crowded room that instantly communicates: 'Let's escape and go home together'?"
    },
    {
        "tw": "在我們相識的這些歲月裡，哪一次我為你煮的一餐飯或買的一杯熱飲，溫暖了你整整一整天？",
        "cn": "在我们相识的这些岁月里，哪一次我为你煮的一餐饭或买的一杯热饮，温暖了你整整一整天？",
        "en": "What simple meal I cooked or warm cup I placed before you unexpectedly thawed an entire freezing week of stress?"
    },
    {
        "tw": "如果用一首歌來代表你心中我們這段感情的主旋律，那一首歌會是悠揚舒緩的民謠，還是深情熱烈的爵士？",
        "cn": "如果用一首歌来代表你心中我们这段感情的主旋律，那一首歌会是悠扬舒缓的民谣，还是深情热烈的爵士？",
        "en": "If a soundtrack captured the emotional climate of our love, is it an earthy acoustic ballad, a playful melody, or midnight blues?"
    },
    {
        "tw": "在你看來，『情慾』與『愛意』在我們的日常相處中，是如何彼此滋養或相互影響的？",
        "cn": "在你看来，“情欲”与“爱意”在我们的日常相处中，是如何彼此滋养或相互影响的？",
        "en": "How do deep emotional affection and sensual attraction dance together in our daily lives—which one tends to unlock the other?"
    },
    {
        "tw": "每當我們經歷了一整天的分別各自奔波，傍晚重聚看見對方的那第一秒，你的心裡閃過的第一個念頭通常是什麼？",
        "cn": "每当我们经历了一整天的分别各自奔波，傍晚重聚看见对方的那第一秒，你的心里闪过的第一个念头通常是什么？",
        "en": "In that split-second when our eyes meet after hours apart, what is the raw, unedited reflex that crosses your consciousness?"
    },
    {
        "tw": "在你的記憶中，我們哪一次的道別或短暫分離，讓你深刻體會到了『原來我已經這麼離不開這個人』？",
        "cn": "在你的记忆中，我们哪一次的道别或短暂分离，让你深刻体会到了“原来我已经这么离不开这个人”？",
        "en": "What airport goodbye or temporary separation made the ache in your ribs reveal just how deeply entwined our roots have become?"
    },
    {
        "tw": "你有沒有發現我哪一個習慣性的小動作，其實是我在偷偷向你撒嬌或討抱抱的信號？",
        "cn": "你有没有发现我哪一个习惯性的小动作，其实是我在偷偷向你撒娇或讨抱抱的信号？",
        "en": "Have you decoded my subtle tell—the quiet little gesture I only do when my inner child is pleading for your warmth?"
    },
    {
        "tw": "在你看來，真正長久的親密關係裡，最難維持的一種品質是熱烈的新鮮感，還是無話不談的坦誠？",
        "cn": "在你看来，真正长久的亲密关系里，最难维持的一种品质是热烈的新鲜感，还是无话不谈的坦诚？",
        "en": "Over decades of love, what is the hardest jewel to keep untarnished: unpredictable romantic voltage, or radically transparent honesty?"
    },
    {
        "tw": "如果現在可以暫停時間一小時，只有我們兩個人安靜地靠在一起，你最希望周圍是什麼樣的聲音？（雨聲、海浪聲還是壁爐柴火？）",
        "cn": "如果现在可以暂停时间一小时，只有我们两个人安静地靠在一起，你最希望周围是什么样的声音？（雨声、海浪声还是壁炉柴火？）",
        "en": "If time froze for sixty minutes right now, what background frequency would you choose to frame our stillness: soft rain or winter fireplace?"
    },
    {
        "tw": "在我們所有的合照裡，哪一張照片最能捕捉到你眼裡看著我時那份毫無防備的溫柔愛意？",
        "cn": "在我们所有的合照里，哪一张照片最能捕捉到你眼里看着我时那份毫无防备的温柔爱意？",
        "en": "Among all the snapshots tucked in our phones, which candid photograph captured your eyes looking at me with total, unvarnished love?"
    },
    {
        "tw": "如果我今晚寫一封只屬於我們倆的私密情書塞進你的枕頭底下，你最希望讀到我對你哪一點的感謝？",
        "cn": "如果我今晚写一封只属于我们俩的私密情书塞进你的枕头底下，你最希望读到我对你哪一点的感谢？",
        "en": "If you found an envelope slipped under your pillow tonight, what quiet virtue of yours would you ache to read my deepest gratitude for?"
    },
    {
        "tw": "在你看來，我們兩個人在一起時，最讓你有被『寵成小朋友』感覺的一件事是什麼？",
        "cn": "在你看来，我们两个人在一起时，最让你可以被“宠成小朋友”感觉的一件事是什么？",
        "en": "What tender indulgence in our dynamic gives you permission to put down your adult responsibilities and be loved like a carefree child?"
    },
    {
        "tw": "你有沒有哪一個肢體接觸的偏好，是以前因為害羞從來不敢開口、但現在很想讓我知道的？",
        "cn": "你有没有哪一个肢体接触的偏好，是以前因为害羞从来不敢开口、但现在很想让我知道的？",
        "en": "Is there a specific touch or physical tenderness you were once too shy to request, but now feel brave enough to invite me into?"
    },
    {
        "tw": "當你累到連一句話都說不出來時，什麼樣的一個眼神或無聲的動作，能讓你明白『我都懂，你安心休息』？",
        "cn": "当你累到连一句话都说不出来时，什么样的一个眼神或无声的动作，能让你明白“我都懂，你安心休息”？",
        "en": "When speech is impossible from pure exhaustion, what silent signal from my hands tells you: 'I see you, lay down, I have everything under control'?"
    },
    {
        "tw": "在我們牽手走過的這段路上，你覺得我們對彼此的愛，是變得更像家人般的平實，還是依然保有一份心跳的悸動？",
        "cn": "在我们牵手走过的这段路上，你觉得我们对彼此的爱，是变得更像家人般的平实，还是依然保有一份心跳的悸动？",
        "en": "As the seasons turn, has our affection matured into the sturdy bedrock of family, or does that thrilling spark still leap across the air?"
    },
    {
        "tw": "今晚當我們說完晚安關上燈之前，你最想得到的最後一個舉動是一個綿長的吻，還是一個緊貼著胸膛的深擁抱？",
        "cn": "今晚当我们说完晚安关上灯之前，你最想得到的最后一个举动是一个绵长的吻，还是一紧贴着胸膛的深拥抱？",
        "en": "Before the lamps click off tonight, what final benediction does your body crave: a lingering kiss, or a long, chest-to-chest embrace?"
    }
]
