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

    function parseMappings(data: string): Map<string, string> {
        var mappings = new Map<string, string>();
        for (let line of data.split("\n")) {
            if (line && !line.startsWith("#")) {
                // ["Kk", "口"]
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
        nextQuestion();
    }

    function nextQuestion() {
        const allComps = Array.from(compFreqs.keys());
        currentComp = allComps[Math.floor(Math.random() * allComps.length)];
        userInput = "";
        lastCheckedInput = "";
        isCorrect = null;
    }

    function checkAnswer() {
        // 如果这个输入已经检查过了，就不再重复检查
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
            // 答案正确时，延迟一小段时间后自动进入下一个
            setTimeout(() => {
                nextQuestion();
            }, 500);
        }
    }

    function handleInput() {
        if (userInput.length > 0) {
            checkAnswer();
        }
    }
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
                    </div>
                {/each}
            </div>

            <div class="text-center">
                <button class="btn variant-filled" on:click={nextQuestion}>下一個</button>
                <button class="btn variant-ghost ml-2" on:click={() => currentMode = "learn"}>返回學習</button>
            </div>
        </div>
    {/if}
</div>
