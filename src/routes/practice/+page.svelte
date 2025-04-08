<script lang="ts">
    import mappingsData from "$lib/assets/hao/hao_map.txt?raw";
    import charDivsData from "$lib/assets/hao/hao_div.txt?raw";
    import charFreqsData from "$lib/assets/practice/freq.txt?raw";
    import { onMount } from "svelte";

    /** 字根-编碼 映射表 */
    var mappings: Map<string, string> = parseMappings(mappingsData);
    /** 漢字-頻率 映射表 */
    var charFreqs: Map<string, number> = parseCharFreq(charFreqsData);
    /** 字根-頻率 映射表 */
    var compFreqs: Map<string, number> = parseCompFreq(charDivsData, charFreqs);

    // 练习相关状态
    var currentMode: "learn" | "practice" = "learn";
    var currentComp: string = "";
    var userInput: string = "";
    var isCorrect: boolean | null = null;
    var score = 0;
    var total = 0;
    var practiceHistory: { comp: string; input: string; correct: boolean }[] = [];
    var lastCheckedInput: string = ""; // 记录上次检查的输入

    // 字根练习记录
    interface CompRecord {
        lastReview: number;    // 上次复习时间
        reviewCount: number;   // 复习次数
        masteryLevel: number;  // 掌握程度（0-1）
    }
    
    var compRecords: Map<string, CompRecord> = new Map();
    var lastPracticedComps: string[] = []; // 记录最近练习过的字根

    // 从localStorage加载练习记录
    function loadCompRecords() {
        const saved = localStorage.getItem('compRecords');
        if (saved) {
            const parsed = JSON.parse(saved);
            compRecords = new Map(Object.entries(parsed));
        }
    }

    // 保存练习记录到localStorage
    function saveCompRecords() {
        const obj = Object.fromEntries(compRecords);
        localStorage.setItem('compRecords', JSON.stringify(obj));
    }

    // 获取字根的掌握程度
    function getMasteryLevel(comp: string): number {
        const record = compRecords.get(comp);
        return record ? record.masteryLevel : 0;
    }

    // 更新字根的练习记录
    function updateCompRecord(comp: string, correct: boolean) {
        const now = Date.now();
        const record = compRecords.get(comp) || {
            lastReview: 0,
            reviewCount: 0,
            masteryLevel: 0
        };

        // 计算字根的难度系数（基于使用频率）
        const freq = compFreqs.get(comp) || 0;
        const maxFreq = Math.max(...Array.from(compFreqs.values()));
        const difficultyFactor = 1 - (freq / maxFreq); // 频率越低，难度越大

        // 计算掌握度变化
        const baseChange = correct ? 0.1 : -0.15; // 基础变化：答对+10%，答错-15%
        const difficultyAdjustment = difficultyFactor * 0.05; // 难度调整：最多±5%
        const change = correct ? 
            baseChange + difficultyAdjustment : // 答对：基础增加 + 难度奖励
            baseChange - difficultyAdjustment;  // 答错：基础减少 - 难度惩罚

        // 更新掌握程度
        const oldMastery = record.masteryLevel;
        const newMastery = Math.max(0, Math.min(1, oldMastery + change));

        compRecords.set(comp, {
            lastReview: now,
            reviewCount: record.reviewCount + 1,
            masteryLevel: newMastery
        });

        // 更新最近练习的字根列表
        lastPracticedComps = [comp, ...lastPracticedComps.slice(0, 9)]; // 保留最近10个练习的字根

        saveCompRecords();
    }

    // 选择下一个要练习的字根
    function selectNextComp(): string {
        const allComps = Array.from(compFreqs.keys());
        
        // 按频率排序的字根列表
        const sortedByFreq = allComps.sort((a, b) => 
            (compFreqs.get(b) || 0) - (compFreqs.get(a) || 0)
        );

        // 过滤掉最近练习过的字根
        const availableComps = sortedByFreq.filter(comp => !lastPracticedComps.includes(comp));
        
        if (availableComps.length === 0) {
            // 如果所有字根都练习过了，重置最近练习列表
            lastPracticedComps = [];
            return sortedByFreq[0];
        }

        // 优先选择高频字根中掌握度低的
        for (const comp of availableComps.slice(0, 100)) { // 只考虑前100个高频字根
            const mastery = getMasteryLevel(comp);
            if (mastery < 0.8) { // 掌握度低于80%的字根
                return comp;
            }
        }

        // 如果高频字根都掌握了，随机选择一个未练习过的字根
        return availableComps[Math.floor(Math.random() * availableComps.length)];
    }

    function parseMappings(data: string): Map<string, string> {
        var mappings = new Map<string, string>();
        for (let line of data.split("\n")) {
            if (line && !line.startsWith("#")) {
                let [code, comp] = line.split("\t");
                mappings.set(comp, code);
            }
        }
        return mappings;
    }
    function parseCharFreq(data: string): Map<string, number> {
        var freqs = new Map<string, number>();
        for (let line of data.split("\n")) {
            if (line && !line.startsWith("#")) {
                let [char, freqStr] = line.split("\t");
                let freq = Number.parseFloat(freqStr);
                freqs.set(char, freq);
            }
        }
        return freqs;
    }
    function parseCompFreq(data: string, charFreqs: Map<string, number>): Map<string, number> {
        var freqs = new Map<string, number>();
        for (let line of data.split("\n")) {
            if (line && !line.startsWith("#")) {
                let [char, div] = line.split("\t");
                let freq = charFreqs.get(char);
                if (!freq) {
                    continue;
                }
                let comps = div.split(" ");
                for (let comp of comps) {
                    freqs.set(comp, (freqs.get(comp) || 0) + freq);
                }
            }
        }
        return freqs;
    }

    // 将字根按频率排序并分组
    var sortedComps = Array.from(compFreqs.entries())
        .sort((a, b) => b[1] - a[1]);
    
    // 按频率分组
    var frequencyGroups = {
        high: sortedComps.slice(0, 50),    // 前50个最常用
        medium: sortedComps.slice(50, 200), // 51-200
        low: sortedComps.slice(200)         // 其余
    };

    // 练习模式函数
    function startPractice() {
        currentMode = "practice";
        score = 0;
        total = 0;
        practiceHistory = [];
        loadCompRecords();
        nextQuestion();
    }

    function nextQuestion() {
        currentComp = selectNextComp();
        userInput = "";
        lastCheckedInput = "";
        isCorrect = null;
    }

    function checkAnswer() {
        if (userInput === lastCheckedInput) {
            return;
        }
        lastCheckedInput = userInput;

        const correctCode = mappings.get(currentComp);
        isCorrect = userInput.toLowerCase() === correctCode?.toLowerCase();
        if (isCorrect) {
            score++;
            total++;
            practiceHistory.push({ comp: currentComp, input: userInput, correct: isCorrect });
            updateCompRecord(currentComp, true);
            setTimeout(() => {
                nextQuestion();
            }, 500);
        } else {
            updateCompRecord(currentComp, false);
            // 2秒后清空输入框和错误提示
            setTimeout(() => {
                userInput = "";
                isCorrect = null;
            }, 2000);
        }
    }

    function handleInput() {
        if (userInput.length >= 2) {
            checkAnswer();
        }
    }

    onMount(() => {
        loadCompRecords();
    });
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">豹碼·字根練習</h1>

    {#if currentMode === "learn"}
        <div class="mb-4">
            <button class="btn variant-filled" on:click={startPractice}>開始練習</button>
        </div>

        <div class="space-y-8">
            {#each Object.entries(frequencyGroups) as [group, comps]}
                <div class="space-y-4">
                    <h2 class="text-xl font-semibold">
                        {#if group === "high"}
                            高頻字根（最常用）
                        {:else if group === "medium"}
                            中頻字根
                        {:else}
                            低頻字根
                        {/if}
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {#each comps as [comp, freq]}
                            <div class="p-4 rounded-lg variant-soft">
                                <div class="text-xl mb-2">{comp}</div>
                                <div class="text-sm text-gray-600">編碼：{mappings.get(comp) || '未知'}</div>
                                <div class="text-sm text-gray-600">使用頻率：{freq.toFixed(2)}</div>
                                <div class="text-sm text-gray-600">掌握程度：{(getMasteryLevel(comp) * 100).toFixed(0)}%</div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <div class="max-w-md mx-auto space-y-4">
            <div class="text-center">
                <div class="text-4xl mb-4">{currentComp}</div>
                <div class="text-sm text-gray-600 mb-2">
                    掌握程度：{(getMasteryLevel(currentComp) * 100).toFixed(0)}%
                </div>
                <input
                    type="text"
                    bind:value={userInput}
                    on:input={handleInput}
                    placeholder="請輸入編碼"
                    class="input p-2 w-full text-center"
                />
                {#if isCorrect !== null}
                    <div class="mt-2 {isCorrect ? 'text-green-500' : 'text-red-500'}">
                        {isCorrect ? '正確！' : '錯誤！正確答案是：' + mappings.get(currentComp)}
                    </div>
                {/if}
            </div>

            <div class="text-center">
                <div class="text-lg">得分：{score}/{total}</div>
                <div class="text-lg">正確率：{total > 0 ? ((score/total) * 100).toFixed(1) : 0}%</div>
            </div>

            <div class="space-y-2">
                <h3 class="font-semibold">練習歷史：</h3>
                {#each practiceHistory.slice().reverse() as {comp, input, correct}}
                    <div class="p-2 rounded {correct ? 'variant-soft' : 'variant-ghost'}">
                        <span class="font-bold">{comp}</span> → 
                        <span class={correct ? 'text-green-500' : 'text-red-500'}>{input}</span>
                        <span class="text-sm text-gray-600 ml-2">
                            (掌握度：{(getMasteryLevel(comp) * 100).toFixed(0)}%)
                        </span>
                    </div>
                {/each}
            </div>

            <div class="text-center">
                <button class="btn variant-ghost ml-2" on:click={() => currentMode = "learn"}>返回學習</button>
            </div>
        </div>
    {/if}
</div>
