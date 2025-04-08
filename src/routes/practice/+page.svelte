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
    /** 字根-汉字 映射表 */
    var compChars: Map<string, string[]> = new Map();

    // 练习相关状态
    var currentMode: "learn" | "practice" = "learn";
    var currentComp: string = "";
    var userInput: string = "";
    var isCorrect: boolean | null = null;
    let score = 0;
    let total = 0;
    let practiceHistory: { comp: string; input: string; correct: boolean }[] = [];
    var lastCheckedInput: string = ""; // 记录上次检查的输入
    let consecutiveCorrect = 0; // 连续答对次数
    let practicedComps: Set<string> = new Set(); // 使用let声明
    var showHistory = false; // 控制练习历史的显示
    let currentPage = 1; // 当前页码
    const pageSize = 10; // 每页显示数量

    // 添加响应式声明
    $: practicedCount = practicedComps.size;
    $: totalCount = mappings.size;
    $: historyCount = practiceHistory.length;
    $: totalPages = Math.ceil(historyCount / pageSize);
    $: displayedHistory = practiceHistory
        .slice()
        .reverse()
        .slice((currentPage - 1) * pageSize, currentPage * pageSize);
    $: historyText = showHistory ? '收起' : '展開';

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
        const baseChange = correct ? 0.5 : -0.5; // 基础变化：答对+50%，答错-50%
        const difficultyAdjustment = difficultyFactor * 0.2; // 难度调整：最多±20%
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

        // 如果有未练习过的字根，优先选择
        const unPracticedComps = availableComps.filter(comp => !practicedComps.has(comp));
        if (unPracticedComps.length > 0) {
            return unPracticedComps[0];
        }

        // 如果所有字根都练习过一遍，选择掌握度低的
        for (const comp of availableComps) {
            const mastery = getMasteryLevel(comp);
            if (mastery < 0.6) { // 降低掌握度标准到60%
                return comp;
            }
        }

        // 如果所有字根都达到基本掌握，随机选择一个
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

    function parseCompChars(data: string) {
        for (let line of data.split("\n")) {
            if (line && !line.startsWith("#")) {
                let [char, div] = line.split("\t");
                let comps = div.split(" ");
                for (let comp of comps) {
                    if (!compChars.has(comp)) {
                        compChars.set(comp, []);
                    }
                    compChars.get(comp)?.push(char);
                }
            }
        }
    }

    // 获取字根相关的汉字（按频率排序）
    function getRelatedChars(comp: string): [string, number][] {
        const chars = compChars.get(comp) || [];
        return chars
            .map(char => [char, charFreqs.get(char) || 0] as [string, number]) // 使用freq.txt中的频率，如果没有则为0
            .sort((a, b) => b[1] - a[1]) // 按频率从高到低排序
            .slice(0, 10); // 只显示前10个
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

    // 从localStorage加载所有练习数据
    function loadPracticeData() {
        loadCompRecords();
        parseCompChars(charDivsData);
        
        // 加载练习过的字根
        const savedPracticed = localStorage.getItem('practicedComps');
        if (savedPracticed) {
            practicedComps = new Set(JSON.parse(savedPracticed));
        }

        // 加载得分
        const savedScore = localStorage.getItem('practiceScore');
        if (savedScore) {
            score = parseInt(savedScore);
        }

        // 加载连续答对次数
        const savedConsecutive = localStorage.getItem('consecutiveCorrect');
        if (savedConsecutive) {
            consecutiveCorrect = parseInt(savedConsecutive);
        }

        // 加载练习历史
        const savedHistory = localStorage.getItem('practiceHistory');
        if (savedHistory) {
            practiceHistory = JSON.parse(savedHistory);
        }
    }

    // 保存所有练习数据到localStorage
    function savePracticeData() {
        saveCompRecords();
        localStorage.setItem('practicedComps', JSON.stringify(Array.from(practicedComps)));
        localStorage.setItem('practiceScore', score.toString());
        localStorage.setItem('consecutiveCorrect', consecutiveCorrect.toString());
        localStorage.setItem('practiceHistory', JSON.stringify(practiceHistory));
    }

    // 练习模式函数
    function startPractice() {
        currentMode = "practice";
        score = 0;
        total = 0;
        consecutiveCorrect = 0;
        practiceHistory = [];
        loadPracticeData();
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
            consecutiveCorrect++;
            // 基础得分2分
            score += 2;
            // 连续答对奖励
            if (consecutiveCorrect >= 10) {
                const bonusMultiplier = Math.floor(consecutiveCorrect / 10); // 每10次翻倍一次
                score += 2 * bonusMultiplier; // 额外奖励 = 2 * 倍数
            }
            total++;
            practiceHistory.push({ comp: currentComp, input: userInput, correct: isCorrect });
            updateCompRecord(currentComp, true);
            // 只有在答对时才添加到已练习字根
            if (!practicedComps.has(currentComp)) {
                practicedComps = new Set([...practicedComps, currentComp]);
                savePracticeData();
            }
            setTimeout(() => {
                nextQuestion();
            }, 500);
        } else {
            consecutiveCorrect = 0; // 答错重置连续答对次数
            score -= 1; // 答错扣1分
            updateCompRecord(currentComp, false);
            // 2秒后清空输入框和错误提示
            setTimeout(() => {
                userInput = "";
                isCorrect = null;
            }, 2000);
        }
        savePracticeData();
    }

    function handleInput() {
        if (userInput.length >= 2) {
            checkAnswer();
        }
    }

    // 重置所有练习数据
    function resetPractice() {
        if (!confirm('確定要重置所有練習數據嗎？這將清除所有練習記錄、得分和掌握程度。')) {
            return;
        }
        
        // 重置所有状态
        score = 0;
        total = 0;
        consecutiveCorrect = 0;
        practiceHistory = [];
        practicedComps = new Set();
        compRecords = new Map();
        lastPracticedComps = [];
        
        // 清除localStorage中的数据
        localStorage.removeItem('compRecords');
        localStorage.removeItem('practicedComps');
        localStorage.removeItem('practiceScore');
        localStorage.removeItem('consecutiveCorrect');
        localStorage.removeItem('practiceHistory');
        
        // 返回学习模式
        currentMode = "learn";
    }

    // 切换页码
    function changePage(page: number) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }

    onMount(() => {
        loadPracticeData();
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
                <div class="text-sm text-gray-600 mb-2">
                    相關漢字：
                    {#each getRelatedChars(currentComp) as [char, freq]}
                        <span class="ml-1 {freq > 0.1 ? 'font-bold' : ''}">
                            {char}
                            {#if freq > 0.1}
                                <span class="text-xs text-gray-500">({freq.toFixed(2)})</span>
                            {/if}
                        </span>
                    {/each}
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
                <div class="text-lg">得分：{score}</div>
                <div class="text-sm text-gray-600">
                    練習進度：{practicedCount}/{totalCount}
                </div>
                <div class="text-sm text-gray-600">
                    {#if consecutiveCorrect >= 10}
                        連續答對{consecutiveCorrect}次，額外+{2 * Math.floor(consecutiveCorrect / 10)}分！
                    {/if}
                </div>
            </div>

            <div class="space-y-2">
                <div class="flex items-center justify-between cursor-pointer" on:click={() => showHistory = !showHistory}>
                    <h3 class="font-semibold">練習歷史：</h3>
                    <span class="text-sm text-gray-600">
                        {historyText} ({historyCount})
                    </span>
                </div>
                {#if showHistory}
                    {#each displayedHistory as {comp, input, correct}}
                        <div class="p-2 rounded {correct ? 'variant-soft' : 'variant-ghost'}">
                            <span class="font-bold">{comp}</span> → 
                            <span class={correct ? 'text-green-500' : 'text-red-500'}>{input}</span>
                            <span class="text-sm text-gray-600 ml-2">
                                (掌握度：{(getMasteryLevel(comp) * 100).toFixed(0)}%)
                            </span>
                        </div>
                    {/each}
                    {#if totalPages > 1}
                        <div class="flex justify-center space-x-2 mt-2">
                            <button 
                                class="btn variant-ghost" 
                                on:click={() => changePage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                上一页
                            </button>
                            <span class="text-sm text-gray-600">
                                第 {currentPage} 页，共 {totalPages} 页
                            </span>
                            <button 
                                class="btn variant-ghost" 
                                on:click={() => changePage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                下一页
                            </button>
                        </div>
                    {/if}
                {/if}
            </div>

            <div class="text-center space-x-2">
                <button class="btn variant-ghost" on:click={() => currentMode = "learn"}>返回學習</button>
                <button class="btn variant-ghost" on:click={resetPractice}>重置練習</button>
            </div>
        </div>
    {/if}
</div>
