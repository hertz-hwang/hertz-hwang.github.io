<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";
    import { Action, ActionType, Callout, Key } from "./model/keyboardLayout";
    import ActionEdit from "./Action.svelte";
    import IconRange from "$lib/Component/IconRange.svelte";
    import IconButton from "$lib/Component/IconButton.svelte";
    import Details from "$lib/Component/Details.svelte";

    export var landscape: boolean = false;
    /** 绑定的按键对象 */
    export var key: Key;
    export var clipAction: Action;
    export var keyStyleNames: string[];

    const icons: [string, string, string, string] = [
        "mdi:gesture-swipe-left",
        "mdi:gesture-swipe-down",
        "mdi:gesture-swipe-up",
        "mdi:gesture-swipe-right",
    ];

    // 当样式不存在時, 将按键样式恢復爲空
    $: {
        let [lightStyleExists, darkStyleExists] = [false, false];
        for (let keyStyleName of keyStyleNames) {
            if ((!key.lightStyle || lightStyleExists) && (!key.darkStyle || darkStyleExists)) {
                break;
            }
            if (key.lightStyle === keyStyleName) {
                lightStyleExists = true;
            }
            if (key.darkStyle === keyStyleName) {
                darkStyleExists = true;
            }
        }
        if (!lightStyleExists) {
            key.lightStyle = "";
        }
        if (!darkStyleExists) {
            key.darkStyle = "";
        }
    }

    function activateSwipe(index: number): void {
        key.swipe[index].action.type = ActionType.character;
    }

    var dispatch = createEventDispatcher();
    /** 选擇下一個按键 */
    function selectNextKey(): void {
        dispatch("selectnext");
    }
    /** 发送删除按键事件 */
    function delKey(): void {
        dispatch("delkey");
    }
    /** 发送左移事件 */
    function moveLeft(): void {
        dispatch("moveleft");
    }
    /** 发送右移事件 */
    function moveRight(): void {
        dispatch("moveright");
    }
    /** 发送复制事件 */
    function copyKey(): void {
        dispatch("copykey");
    }
    /** 发送粘贴事件 */
    function pasteKey(): void {
        dispatch("pastekey");
    }

    function onCalloutCountChange(event: Event) {
        const count = Number((event.currentTarget as HTMLInputElement).value);
        if (count < key.callout.length) {
            key.callout = key.callout.slice(0, count);
        } else if (count > key.callout.length) {
            key.callout = [
                ...key.callout,
                ...Array(count - key.callout.length)
                    .fill(0)
                    .map(() => new Callout()),
            ];
        }
    }
    /** 上移长按动作 */
    function moveCalloutUp(index: number): void {
        if (index > 0) {
            [key.callout[index], key.callout[index - 1]] = [key.callout[index - 1], key.callout[index]];
        }
    }
    /** 下移长按动作 */
    function moveCalloutDown(index: number): void {
        if (index + 1 < key.callout.length) {
            [key.callout[index], key.callout[index + 1]] = [key.callout[index + 1], key.callout[index]];
        }
    }
</script>

<!-- 划动配置 -->
<div class="p-2 gap-2 flex flex-col">
    <!-- 键宽和键值编辑区 -->
    <div class="flex flex-col items-center p-[0.5px] rounded-md variant-ringed">
        <div class="flex w-full items-center">
            <div class="h-10 px-2 flex items-center rounded-tl-md variant-ringed">
                <Icon height="20" icon="mdi:gesture-touch" />
            </div>
            <input
                title="调整按键显示标签"
                bind:value={key.label.text}
                placeholder="标签"
                style:font-family="sans-serif, Symbols Nerd Font"
                class="h-10 px-2 grow rounded-none variant-ringed hover:variant-ghost"
            />
            <button
                title="是否经由 Rime 处理"
                on:click={() => (key.processByRIME = !key.processByRIME)}
                class="h-10 px-2 rounded-tr-md hover:variant-ghost active:scale-95 variant-ringed"
            >
                <Icon height="20" icon={key.processByRIME ? "mdi:web" : "mdi:web-off"} />
            </button>
        </div>
        {#if key.action.type === ActionType.space}
            <div class="flex w-full items-center">
                <input
                    title="调整空格键的加载时标签"
                    bind:value={key.label.loading}
                    placeholder="加载标签"
                    style:font-family="sans-serif, Symbols Nerd Font"
                    class="h-10 px-2 grow rounded-none variant-ringed hover:variant-ghost"
                />
            </div>
        {/if}
        <div class="flex w-full items-center">
            <input
                title="使用 SF Symbol 作为标签 (覆盖文本标签)"
                bind:value={key.label.sysImage}
                placeholder="SF Symbol"
                class="h-10 px-2 font-mono grow rounded-none variant-ringed hover:variant-ghost"
            />
        </div>
        <ActionEdit bind:action={key.action} bind:clipAction />
    </div>

    <Details summary="划动动作配置">
        <div class="p-1.5 gap-2 flex flex-col">
            {#each [2, 1, 0, 3] as index (key.swipe[index].id)}
                <div class="flex flex-col items-center p-[0.5px] rounded-md variant-ringed">
                    {#if key.swipe[index].action.type === ActionType.none}
                        <div class="flex w-full">
                            <div class="h-10 px-2 flex items-center rounded-l-md variant-ringed">
                                <Icon height="20" icon={icons[index]} />
                            </div>
                            <button
                                title="添加划动配置"
                                on:click={() => {
                                    activateSwipe(index);
                                }}
                                class="h-10 px-2 rounded-r-md grow flex justify-center items-center variant-ringed hover:variant-ghost"
                            >
                                <Icon height="20" icon="mdi:plus" />
                            </button>
                        </div>
                    {:else}
                        <div class="flex w-full">
                            <div class="h-10 px-2 flex items-center rounded-tl-md variant-ringed">
                                <Icon height="20" icon={icons[index]} />
                            </div>
                            <input
                                title="调整划动显示标签"
                                bind:value={key.swipe[index].label.text}
                                placeholder="标签"
                                style:font-family="sans-serif, Symbols Nerd Font"
                                class="h-10 px-2 grow rounded-none variant-ringed hover:variant-ghost"
                            />
                            <!-- 经由 rime 处理 -->
                            <button
                                title="划动是否经由 Rime 处理"
                                on:click={() => (key.swipe[index].processByRIME = !key.swipe[index].processByRIME)}
                                class="h-10 px-2 variant-ringed hover:variant-ghost"
                            >
                                <Icon height="20" icon={key.swipe[index].processByRIME ? "mdi:web" : "mdi:web-off"} />
                            </button>
                            <!-- 显示划动 -->
                            <button
                                title="是否显示此划动"
                                on:click={() => (key.swipe[index].display = !key.swipe[index].display)}
                                class="h-10 px-2 rounded-tr-md variant-ringed hover:variant-ghost"
                            >
                                <Icon height="20" icon={key.swipe[index].display ? "mdi:eye" : "mdi:eye-off"} />
                            </button>
                        </div>
                        <ActionEdit bind:action={key.swipe[index].action} bind:clipAction />
                    {/if}
                </div>
            {/each}
        </div>
    </Details>

    <!-- 长按动作 -->
    <Details summary="长按动作配置">
        <div class="p-1.5 gap-2 flex flex-col">
            <IconRange
                icon="mdi:table-cog"
                title="长按动作数量"
                value={key.callout.length}
                on:change={onCalloutCountChange}
                min="0"
                max="12"
                class="h-10 px-2 flex items-center rounded-md variant-ringed hover:variant-ghost"
            />
            {#each key.callout as callout, index (callout.id)}
                <div class="flex flex-col items-center p-[0.5px] rounded-md variant-ringed">
                    <div class="flex w-full items-center">
                        <div class="h-10 px-2 flex items-center rounded-tl-md variant-ringed">
                            <Icon height="20" icon="mdi:message-outline" />
                        </div>
                        <input
                            title="调整长按动作标签"
                            bind:value={callout.label.text}
                            placeholder="标签"
                            style:font-family="sans-serif, Symbols Nerd Font"
                            class="h-10 px-2 grow rounded-none variant-ringed hover:variant-ghost"
                        />
                        <IconButton
                            icon="mdi:arrow-up"
                            height="20"
                            title="上移长按动作"
                            on:click={() => {
                                moveCalloutUp(index);
                            }}
                            class="h-10 px-2 variant-ringed hover:variant-ghost active:scale-95"
                        />
                        <IconButton
                            icon="mdi:arrow-down"
                            height="20"
                            title="下移长按动作"
                            on:click={() => {
                                moveCalloutDown(index);
                            }}
                            class="h-10 px-2 rounded-tr-md variant-ringed hover:variant-ghost active:scale-95"
                        />
                    </div>
                    <ActionEdit bind:action={callout.action} bind:clipAction />
                </div>
            {/each}
        </div>
    </Details>

    <!-- 按键样式设置 -->
    <div class="w-full p-[0.5px] rounded-md variant-ringed">
        <div class="w-full flex">
            <div class="h-10 px-2 flex items-center rounded-tl-md variant-ringed">
                <Icon icon="mdi:weather-sunny" />
            </div>
            <span class="h-10 px-2 items-center flex variant-ringed grow shrink"> 亮色样式 </span>
            <select
                bind:value={key.lightStyle}
                class="w-[50%] h-10 px-2 bg-transparent rounded-tr-md variant-ringed hover:variant-ghost"
            >
                <option value="">none</option>
                {#each keyStyleNames as name}
                    <option value={name}>{name}</option>
                {/each}
            </select>
        </div>
        <div class="w-full flex">
            <div class="h-10 px-2 flex items-center rounded-bl-md variant-ringed">
                <Icon icon="mdi:weather-night" />
            </div>
            <span class="h-10 px-2 items-center flex variant-ringed grow shrink"> 暗色样式 </span>
            <select
                bind:value={key.darkStyle}
                class="w-[50%] h-10 px-2 bg-transparent rounded-br-md variant-ringed hover:variant-ghost"
            >
                <option value="">none</option>
                {#each keyStyleNames as name}
                    <option value={name}>{name}</option>
                {/each}
            </select>
        </div>
    </div>

    <!-- 按键动作按钮 -->
    <div class="w-full flex mx-auto p-[0.5px] rounded-md variant-ringed overflow-auto">
        <button
            title="在键盘中删除此按键"
            on:click={delKey}
            class="gap-1 p-2 flex items-center rounded-l-md variant-ringed hover:variant-ghost active:scale-95"
        >
            <Icon height="20" icon="mdi:close" />
        </button>
        <button
            title="将此按键左移一位"
            on:click={moveLeft}
            class="gap-1 p-2 flex items-center variant-ringed hover:variant-ghost active:scale-95"
        >
            <Icon height="20" icon="mdi:arrow-left" />
        </button>
        <button
            title="自动键宽"
            on:click={() => {
                if (landscape) {
                    key.autoLandscape = !key.autoLandscape;
                } else {
                    key.autoWidth = !key.autoWidth;
                }
            }}
            class="gap-1 p-2 flex items-center variant-ringed hover:variant-ghost active:scale-95"
        >
            <Icon
                height="20"
                icon={(landscape ? key.autoLandscape : key.autoWidth) ? "mdi:table-sync" : "mdi:table-remove"}
            />
        </button>
        {#if landscape}
            <input
                title="调整按键宽度"
                type="number"
                bind:value={key.landscape}
                placeholder="键宽"
                min={1}
                max={100}
                class="min-w-0 grow shrink p-2 rounded-none variant-ringed hover:variant-ghost"
            />
        {:else}
            <input
                title="调整按键宽度"
                type="number"
                bind:value={key.width}
                placeholder="键宽"
                min={1}
                max={100}
                class="min-w-0 grow shrink p-2 rounded-none variant-ringed hover:variant-ghost"
            />
        {/if}
        <button
            title="复制按键配置"
            on:click={copyKey}
            class="gap-1 p-2 flex items-center variant-ringed hover:variant-ghost active:scale-95"
        >
            <Icon height="20" icon="mdi:content-copy" />
        </button>
        <button
            title="粘贴按键配置"
            on:click={pasteKey}
            class="gap-1 p-2 flex items-center variant-ringed hover:variant-ghost active:scale-95"
        >
            <Icon height="20" icon="mdi:content-paste" />
        </button>
        <button
            title="将此按键右移一位"
            on:click={moveRight}
            class="gap-1 p-2 flex items-center variant-ringed hover:variant-ghost active:scale-95"
        >
            <Icon height="20" icon="mdi:arrow-right" />
        </button>
        <button
            title="继续编辑下一个按键"
            on:click={selectNextKey}
            class="gap-1 p-2 flex items-center rounded-r-md variant-ringed hover:variant-ghost active:scale-95"
        >
            <Icon height="20" icon="mdi:check-circle-outline" />
        </button>
    </div>
</div>
