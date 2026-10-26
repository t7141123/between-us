# -*- coding: utf-8 -*-
"""
Category: growth (成長與對話 / Growth & Conflict Repair)
Authoritative Sources:
- Dr. John Gottman: Conflict Resolution & Repair Attempts, The Four Horsemen
- We're Not Really Strangers (WNRS): Level 3 Reflection
- The School of Life: Relationship Maintenance & Rows
- Marshall Rosenberg: Nonviolent Communication (NVC)
"""

GROWTH_QUESTIONS = [
    {
        "tw": "回顧我們過去吵得最兇或最僵的一次，那場衝突反而教會了你關於我們倆的什麼事？",
        "cn": "回顾我们过去吵得最凶或最僵的一次，那场冲突反而教会了你关于我们俩的什么事？",
        "en": "Looking back at our fiercest or most painful argument, what hard-won revelation about us did that storm ultimately teach you?"
    },
    {
        "tw": "當我們意見不合或我說話語氣不好時，你心底最常浮現的第一個防衛機制是逃避、反擊還是冷戰？",
        "cn": "当我们意见不合或我说话语气不好时，你心底最常浮现的第一个防卫机制是逃避、反击还是冷战？",
        "en": "When tensions flare or my tone turns sharp, what is your involuntary defensive fortress: stonewalling, counter-attacking, or fleeing?"
    },
    {
        "tw": "在你看來，跟我談戀愛或生活在一起，最辛苦、最不容易被外人理解的地方是什麼？",
        "cn": "在你看来，跟我谈恋爱或生活在一起，最辛苦、最不容易被外人理解的地方是什么？",
        "en": "In your most candid honesty, what is the most taxing, complicated, or exhausting part of sharing your life with me?"
    },
    {
        "tw": "在這段關係裡，你為我們默默做出過哪一次妥協或改變，是你覺得自己很成熟、但也希望被我看見的？",
        "cn": "在这段关系里，你为我们默默做出过哪一次妥协或改变，是你觉得自己很成熟、但也希望被我看见的？",
        "en": "What private compromise or intentional growth step did you take for the sake of our peace that you quietly wish I noticed more?"
    },
    {
        "tw": "如果今天我們要約定一個『暫停爭吵的暗號』，當情緒失控時說出哪一句話能讓我們立刻冷靜下來？",
        "cn": "如果今天我们要约定一个“暂停争吵的暗号”，当情绪失控时说出哪一句话能让我们立刻冷静下来？",
        "en": "What agreed 'safe word' or grounding gesture could either of us offer in mid-fight to instantly call a 20-minute emotional ceasefire?"
    },
    {
        "tw": "在我們的溝通模式裡，哪一種說話方式或用字最容易在瞬間踩中你的地雷、讓你理智斷線？",
        "cn": "在我们的沟通模式里，哪一种说话方式或用字最容易在瞬间踩中你的地雷、让你理智断线？",
        "en": "In our arguments, what specific phrase or condescending inflection acts as an instant match to your emotional powder keg?"
    },
    {
        "tw": "自從跟我在一起之後，你覺得你自己身上最大的成長或轉變是什麼？你喜歡現在這個自己嗎？",
        "cn": "自从跟我在一起之后，你觉得你自己身上最大的成长或转变是什么？你喜欢现在这个自己吗？",
        "en": "Since intertwining your life with mine, what is the most profound personal evolution you observe in yourself, and do you love who you are becoming?"
    },
    {
        "tw": "你覺得我們之間有沒有哪個一再重複出現的小摩擦，其實背後藏著一個我們從沒真正解決的深層渴望？",
        "cn": "你觉得我们之间有没有哪个一再重复出现的小摩擦，其实背后藏着一个我们从没真正解决的深层渴望？",
        "en": "What petty recurring quarrel keeps resurfacing between us, and what unacknowledged childhood longing is actually fueling it beneath the surface?"
    },
    {
        "tw": "每當我們吵架和好之後，什麼樣的舉動最能讓你心裡的芥蒂完全消失、重回踏實？",
        "cn": "每当我们吵架和好之后，什么样的举动最能让你心里的芥蒂完全消失、重回踏实？",
        "en": "After we have talked through a disagreement, what physical embrace or gentle action officially closes the rift and makes you feel whole again?"
    },
    {
        "tw": "客觀來說，你覺得在成為一個更好的伴侶這條路上，我目前最需要努力改善的盲點是什麼？",
        "cn": "客观来说，你觉得在成为一个更好的伴侣这条路上，我目前最需要努力改善的盲点是什么？",
        "en": "With compassionate gentleness, what single blind spot of mine would you invite me to stretch into healing to become a better partner?"
    },
    {
        "tw": "在你看來，每當我有情緒或說話帶刺時，你能夠看穿那其實是我在無助呼救，還是會忍不住跟著暴怒？",
        "cn": "在你看来，每当我有情绪或说话带刺时，你能够看穿那其实是我在无助呼救，还是会忍不住跟着暴怒？",
        "en": "When I lash out with barbed words, can you recognize it as an anxious cry for attachment, or does your nervous system instantly meet fire with fire?"
    },
    {
        "tw": "回想我們剛在一起的第一年和現在，你覺得我們處理意見不合的方式，有了怎樣最顯著的進步？",
        "cn": "回想我们刚在一起的第一年和现在，你觉得我们处理意见不合的方式，有了怎样最显著的进步？",
        "en": "Comparing our first year together to this present moment, what is our single proudest victory in how we navigate friction?"
    },
    {
        "tw": "當我們意見分歧時，你心底深處是更在乎『誰是對的、邏輯誰合理』，還是『雙方的情緒是否被照顧到了』？",
        "cn": "当我们意见分歧时，你心底深处是更在乎“谁是对的、逻辑谁合理”，还是“双方的情绪是否被照顾到了”？",
        "en": "In the heat of a clash, does your ego secretly fight to win the factual debate, or does your heart prioritize emotional safety first?"
    },
    {
        "tw": "有沒有哪一次你為我做出的重大退讓，其實心裡非常委屈、很希望我能在事後多給你一些肯定和感謝？",
        "cn": "有没有哪一次你为我做出的重大退让，其实心里非常委屈、很希望我能在事后多给你一些肯定和感谢？",
        "en": "Was there a heavy sacrifice you made for my benefit that left you feeling secretly drained, where you deeply wished for deeper acknowledgment?"
    },
    {
        "tw": "在你看來，我們兩個人在吵架時，誰通常更擅長主動給彼此台階下？你希望這個模式有什麼微調？",
        "cn": "在你看来，我们两个人吵架时，谁通常更擅长主动给彼此台阶下？你希望这个模式有什么微调？",
        "en": "Between the two of us, who historically carries the burden of extending the olive branch first? How could we make that dance more balanced?"
    },
    {
        "tw": "在我們日常的家務分工與生活瑣碎裡，你有沒有哪一個看不見的心力負擔（Invisible Labor），是希望我能更主動承擔的？",
        "cn": "在我们日常的家务分工与生活琐碎里，你有没有哪一个看不见的心力负担（Invisible Labor），是希望我能更主动承担的？",
        "en": "What invisible mental load or household chore do you quietly carry that you wish I stepped in to shoulder without being asked?"
    },
    {
        "tw": "當你看著我在某些個人缺點上反覆掙扎、難以改變時，你心裡的真實感受是包容、心疼，還是偶爾會升起無力感？",
        "cn": "当你看着我在某些个人缺点上反复挣扎、难以改变时，你心里的真实感受是包容、心疼，还是偶尔会升起无力感？",
        "en": "When you observe me wrestling repeatedly with the same personal stubbornness, does your patience feel compassionate or occasionally exhausted?"
    },
    {
        "tw": "如果能給我們過去一年的溝通表現打分數（1到10分），你會打幾分？要達到滿分我們還缺少什麼？",
        "cn": "如果能给我们过去一年的沟通表现打分数（1到10分），你会打几分？要达到满分我们还缺少什么？",
        "en": "On a scale of 1 to 10, how would you rate our communication resilience over the past year, and what is the missing bridge to a 10?"
    },
    {
        "tw": "你覺得我們在公共場合或有朋友在場時，有沒有哪一次我的玩笑開得太過火，讓你在當下感到難堪或不舒服？",
        "cn": "你觉得我们在公共场合或有朋友在场时，有没有哪一次我的玩笑开得太过火，让你在当下感到难堪或不舒服？",
        "en": "Was there an instance in public where a tease or joke I made crossed into embarrassing you, leaving a sting you hid until later?"
    },
    {
        "tw": "在你看來，『道歉』這件事最核心的要素是什麼？是說出對不起三個字，還是具體承諾往後不再犯？",
        "cn": "在你看来，“道歉”这件事最核心的要素是什么？是说出对不起三个字，还是具体承诺往后不再犯？",
        "en": "What makes an apology genuinely restorative for you: hearing the words 'I'm sorry,' feeling my empathy, or seeing tangible behavioral change?"
    },
    {
        "tw": "在我們過去的所有爭吵中，哪一次我和好時說出的話或給你的擁抱，讓你打從心底覺得我們的愛經得起考驗？",
        "cn": "在我们过去的所有争吵中，哪一次我和好时说出的话或给你的拥抱，让你打从心底觉得我们的爱经得起考验？",
        "en": "Which reconciliation in our history was so tender that it actually made your faith in our lasting love stronger than before the fight?"
    },
    {
        "tw": "當我們在討論一件嚴肅的事情時，我的哪一種肢體語言（如雙手抱胸、嘆氣、眼神飄移）最容易讓你感到挫折？",
        "cn": "当我们在讨论一件严肃的事情时，我的哪一种肢体语言（如双手抱胸、叹气、眼神飘移）最容易让你感到挫折？",
        "en": "In deep conversations, what physical micro-expression of mine (heavy sighing, eye-rolling, crossed arms) makes you feel immediately shut out?"
    },
    {
        "tw": "你覺得我們兩個人在面對壓力時，是屬於『相濡以沫共同抗壓』，還是容易『把壓力發洩在對方身上』？",
        "cn": "你觉得我们两个人面对压力时，是属于“相濡以沫共同抗压”，还是容易“把压力发泄在对方身上”？",
        "en": "When outside world stress mounts, do we instinctively circle our wagons as a united team, or accidentally take our fraying nerves out on each other?"
    },
    {
        "tw": "在你看來，跟我在一起之後，你原先生活中的哪一個壞習慣或盲點，被我們的關係溫柔地改變了？",
        "cn": "在你看来，跟我在一起之后，你原先生活中的哪一个坏习惯或盲点，被我们的关系温柔地改变了？",
        "en": "What unhealthy habit or abrasive edge in your solitary life has our relationship gently healed or polished away?"
    },
    {
        "tw": "如果我們今天共同訂立一條『爭吵時的絕對紅線』，你最希望寫下哪一條規則？（例如：絕不提分手、絕不摔東西、絕不翻陳年舊帳）",
        "cn": "如果我们今天共同订立一条“争吵时的绝对红线”，你最希望写下哪一条规则？（例如：绝不提分手、绝不摔东西、绝不翻陈年旧账）",
        "en": "If we ratified one inviolable treaty rule for all future fights (e.g. never threaten the relationship, never bring up ancient baggage), what would it be?"
    },
    {
        "tw": "每當你覺得自己的付出被我視為理所當然時，你心底最常升起的一種委屈是什麼？我怎麼做能及時彌補？",
        "cn": "每当你觉得自己的付出被我视为理所当然时，你心底最常升起的一种委屈是什么？我怎么做能及时弥补？",
        "en": "When your quiet sacrifices feel taken for granted, what ache surfaces, and what specific appreciation can heal it immediately?"
    },
    {
        "tw": "在你看來，兩個人要維繫長久的感情，最需要戒掉的一種思維模式是『比較心』還是『理所當然的心態』？",
        "cn": "在你看来，两个人要维系长久的感情，最需要戒掉的一种思维模式是“比较心”还是“理所当然的心态”？",
        "en": "To maintain thriving love over decades, what toxic mindset must be eradicated: comparing ourselves to others, or creeping entitlement?"
    },
    {
        "tw": "有沒有哪一次我看見了你的憤怒背後其實是無比的害怕，並給了你一個深刻的擁抱？那次經歷對你來說意味著什麼？",
        "cn": "有没有哪一次我看见了你的愤怒背后其实是无比的害怕，并给了你一个深刻的拥抱？那次经历对你来说意味着什么？",
        "en": "Can you recall a time I saw straight past your roaring anger to the terrified child beneath, and reached out with compassion instead of defense?"
    },
    {
        "tw": "在我們的相處中，你覺得我們目前最需要刻意培養或加深的一種溝通習慣是什麼？",
        "cn": "在我们的相处中，你觉得我们目前最需要刻意培养或加深的一种沟通习惯是什么？",
        "en": "What proactive conversational muscle do we most urgently need to exercise together: active daily check-ins, or gentle appreciation sharing?"
    },
    {
        "tw": "當你發現我陷入情緒死胡同或固執己見時，你覺得用什麼樣的切入點，最能幫我鬆開防備重新思考？",
        "cn": "当你发现我陷入情绪死胡同或固执己见时，你觉得用什么样的切入点，最能帮我松开防备重新思考？",
        "en": "When you observe me locked in stubborn pride, what gentle key unlocks my drawbridge without making me feel humiliated?"
    },
    {
        "tw": "在你看來，『包容伴侶的缺點』與『委屈自己的底線』之間，界線究竟在哪裡？我們有跨過那條界線過嗎？",
        "cn": "在你看来，“包容伴侣的缺点”与“委屈自己的底线”之间，界线究竟在哪里？我们有跨过那条界线过吗？",
        "en": "Where is the boundary between generous patience for a partner's flaws, and self-erasing betrayal of your own dignity?"
    },
    {
        "tw": "回顧我們過去這段時間，哪一次我們共同克服的外在考驗，讓你由衷地為我們這個小團隊感到驕傲？",
        "cn": "回顾我们过去这段时间，哪一次我们共同克服的外在考验，让你由衷地为我们这个小团队感到骄傲？",
        "en": "What external hardship or logistical crisis did we conquer side-by-side that left you deeply proud of our tag-team partnership?"
    },
    {
        "tw": "在你看來，我在情緒激動時最容易犯下的一個溝通毛病是什麼？（例如：急於辯解、打斷你說話、誇大其詞）",
        "cn": "在你看来，我在情绪激动时最容易犯下的一个沟通毛病是什么？（例如：急于辩解、打断你说话、夸大其词）",
        "en": "Under emotional duress, what is my most predictable bad arguing habit: interrupting you, invalidating your feelings, or using absolute words like 'always'?"
    },
    {
        "tw": "當我們意見僵持不下時，你最希望我們如何決定這一次聽誰的？（輪流決定、交給更專業的一方，還是共同尋求折衷第三方案？）",
        "cn": "当我们意见僵持不下时，你最希望我们如何决定这一次听谁的？（轮流决定、交给更专业的一方，还是共同寻求折衷第三方案？）",
        "en": "In a 50/50 deadlock where compromise seems impossible, what tie-breaking wisdom do you want us to defer to?"
    },
    {
        "tw": "你覺得我們兩個人在表達『我需要你、我很想你』這件事上，誰通常更自然？誰可能還帶著一絲彆扭？",
        "cn": "你觉得我们两个人表达“我需要你、我很想你”这件事上，谁通常更自然？谁可能还带着一丝别扭？",
        "en": "Between the two of us, who expresses 'I miss you and need you' with ease, and who still guards their pride with shy hesitation?"
    },
    {
        "tw": "在你看來，長久相處的伴侶之間，適度的『爭吵與摩擦』是感情健康的標誌，還是關係出現裂痕的警訊？",
        "cn": "在你看来，长久相处的伴侣之间，适度的“争吵与摩擦”是感情健康的标志，还是关系出现裂痕的警讯？",
        "en": "Do you view passionate disagreement as vital emotional honest ventilation, or as an alarming signal of underlying damage?"
    },
    {
        "tw": "有沒有哪一個生活領域（如作息、飲食、空間整潔），是你覺得我們至今仍在努力磨合但非常值得堅持的？",
        "cn": "有没有哪一个生活领域（如作息、饮食、空间整洁），是你觉得我们至今仍努力磨合但非常值得坚持的？",
        "en": "What practical lifestyle friction (sleep schedules, domestic cleanliness, food habits) are we still navigating that is worth the ongoing patience?"
    },
    {
        "tw": "在你看來，當我們其中一方事業有成或獲得肯定時，另一方能毫無保留地為對方喝采，我們這點做得好嗎？",
        "cn": "在你看来，当我们其中一方事业有成或获得肯定时，另一方能毫无保留地为对方喝彩，我们这点做得好吗？",
        "en": "When one of us triumphs in the world, do you feel pure, unadulterated cheering from the other, or does subtle comparison ever intrude?"
    },
    {
        "tw": "如果可以坐時光機回到我們第一次產生大矛盾的那個夜晚，你會給當時氣呼呼的我們一句什麼樣的提醒？",
        "cn": "如果可以坐时光机回到我们第一次产生大矛盾的那个夜晚，你会给当时气呼呼的我们一句什么样的提醒？",
        "en": "If you could step into the room of our very first big fight, what loving perspective would you whisper to our angry younger selves?"
    },
    {
        "tw": "在我們相處的點點滴滴中，你看見我為你做出過最勇敢或最不容易的一件事是什麼？",
        "cn": "在我们相处的点点滴滴中，你看见我为你做出过最勇敢或最不容易的一件事是什么？",
        "en": "What is the most courageous, costly, or generous act of devotion you have witnessed me make for your heart?"
    },
    {
        "tw": "當你發現我因為工作或其他壓力而把情緒倒在你身上時，你最希望我事後如何誠懇地向你道歉並修復？",
        "cn": "当你发现我因为工作或其他压力而把情绪倒在你身上时，你最希望我事后如何诚恳地向你道歉并修复？",
        "en": "When my outside frustration spills over into snapping at you, what genuine acknowledgment repairs the sting and restores our peace?"
    },
    {
        "tw": "在你看來，兩個人在一起生活，最不能妥協的相處底線是『尊重對方的獨立人格』還是『毫無隱瞞的坦誠』？",
        "cn": "在你看来，两个人在一起生活，最不能妥协的相处底线是“尊重对方的独立人格”还是“毫无隐瞒的坦诚”？",
        "en": "Between sovereign respect for personal boundaries and total unmasked transparency, which pillar is more foundational for you?"
    },
    {
        "tw": "每當你看見我在學習新事物或努力改變某個盲點時，你心底對我的情感是欣賞、自豪，還是更深的一層愛意？",
        "cn": "每当你看见我在学习新事物或努力改变某个盲点时，你心底对我的情感是欣赏、自豪，还是更深的一层爱意？",
        "en": "When you catch me stumbling through learning a new habit or self-correcting a flaw, what warm pride swells in your chest?"
    },
    {
        "tw": "你覺得我們兩個人在面對各自的原生家庭時，我們是否已經成功建立起屬於我們這個小家庭的最高忠誠度？",
        "cn": "你觉得我们两个人面对各自的原生家庭时，我们是否已经成功建立起属于我们这个小家庭的最高忠诚度？",
        "en": "Have we succeeded in establishing that our shared partnership is the primary alliance in life, taking precedence even over our families of origin?"
    },
    {
        "tw": "在你看來，『經營親密關係』這件事，在我們的日常優先級裡，是被排在第一位，還是偶爾會被其他待辦事項往後推？",
        "cn": "在你看来，“经营亲密关系”这件事，在我们的日常优先级里，是被排在第一位，还是偶尔会被其他待办事项往后推？",
        "en": "Does tending our romance sit as an untouchable top priority in our calendar, or does it frequently get pushed aside by utilitarian chores?"
    },
    {
        "tw": "你有沒有哪一個長久以來的內心傷痕，是在遇到我之後，因為我的理解與陪伴，才終於慢慢結痂癒合的？",
        "cn": "你有没有哪一个长久以来的内心伤痕，是在遇到我之后，因为我的理解与陪伴，才终于慢慢结痂愈合的？",
        "en": "What chronic past wound did you carry for years that only began to soften and scar over in the gentle warmth of our relationship?"
    },
    {
        "tw": "在你看來，我們兩個人在面對挫折與失敗時的抗壓韌性，跟剛在一起時相比，有了怎樣深刻的成長？",
        "cn": "在你看来，我们两个人面对挫折与失败时的抗压韧性，跟刚在一起时相比，有了怎样深刻的成长？",
        "en": "How has our shared threshold for enduring bad news and emotional setbacks strengthened since the honeymoon days?"
    },
    {
        "tw": "如果今天可以為我們兩個人的相處寫一條永恆的『伴侶相處黃金法則』，你會寫下哪句話？",
        "cn": "如果今天可以为我们两个人的相处写一条永恒的“伴侣相处黄金法则”，你会写下哪句话？",
        "en": "If you could engrave one overarching Golden Rule onto the living room wall of our love, what single sentence would guide us forever?"
    },
    {
        "tw": "謝謝你陪伴我一起在愛中成長與蛻變。在這一秒，你最想給我的一個深情眼神或擁抱，會包含怎樣的感激？",
        "cn": "谢谢你陪伴我一起在爱中成长与蜕变。在这一秒，你最想给我的一个深情眼神或拥抱，会包含怎样的感激？",
        "en": "Thank you for holding my hand through every awkward, painful growth spurt. In this second, what does your embrace whisper of gratitude?"
    },
    {
        "tw": "看著彼此一路走來的改變與堅持，你是否深深為我們今天所建立的信任與默契感到無比驕傲？",
        "cn": "看着彼此一路走来的改变与坚持，你是否深深为我们今天所建立的信任与默契感到无比骄傲？",
        "en": "Looking at everything we have survived and rebuilt, do you feel an overwhelming pride in the unbreakable fortress we have crafted together?"
    }
]
