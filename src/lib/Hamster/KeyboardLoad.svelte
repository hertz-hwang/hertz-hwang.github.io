<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";

    export var keyboard: any;
    export var remove: boolean = false;
    export var override: boolean = false;

    const [modeRemove, modeOverride, modeLoad] = [1, 2, 3];
    var opMode = 0;
    var timeout: NodeJS.Timeout;
    $: name = typeof keyboard.name === "string" ? keyboard.name : "键盘";

    $: display = !opMode
        ? name
        : `${opMode === modeRemove ? "删除" : opMode === modeOverride ? "覆盖" : "加载"}中, 点击取消`;

    /** 延迟作业 */
    function delay(f: () => void) {
        clearTimeout(timeout);
        timeout = setTimeout(f, 2000);
    }
    /** 切换模式 */
    function setMode(mode: number): number {
        if (opMode === 0) {
            opMode = mode;
        } else {
            opMode = 0;
        }
        return opMode;
    }

    const dispatch = createEventDispatcher();
    /** 移除按钮点击事件 */
    function onRemove(): void {
        dispatch("remove");
    }
    /** 加载按钮点击事件 */
    function onLoad(): void {
        dispatch("load");
    }
    /** 覆盖按钮点击事件 */
    function onOverride(): void {
        dispatch("override");
    }

    /** 准备删除 */
    function tryRemove(): void {
        if (setMode(modeRemove)) {
            delay(() => {
                if (opMode === modeRemove) {
                    opMode = 0;
                    onRemove();
                }
            });
        }
    }
    /** 准备加载 */
    function tryLoad(): void {
        if (setMode(modeLoad)) {
            delay(() => {
                if (opMode === modeLoad) {
                    opMode = 0;
                    onLoad();
                }
            });
        }
    }
    /** 准备覆盖 */
    function tryOverride(): void {
        if (setMode(modeOverride)) {
            delay(() => {
                if (opMode === modeOverride) {
                    opMode = 0;
                    onOverride();
                }
            });
        }
    }
</script>

<div class="px-2 py-1 h-8 gap-1 rounded-md variant-ringed hover:variant-ghost flex items-center">
    <!-- 删除存档 -->
    {#if remove}
        <button
            title="删除此存档数据"
            on:click={tryRemove}
            class="p-1 rounded-full hover:variant-ringed flex items-center"
        >
            <Icon icon={opMode === modeRemove ? "mdi:cancel" : "mdi:close"} />
        </button>
    {/if}
    <!-- 加载存档 -->
    <button
        title="点击以此存档数据覆盖当前编辑配置"
        on:click={tryLoad}
        class="p-1 w-full justify-center rounded-md flex items-center text-nowrap"
        class:text-xs={opMode}
    >
        {display}
    </button>
    <!-- 覆盖存档 -->
    {#if override}
        <button
            title="将当前编辑配置覆盖到此存档上"
            on:click={tryOverride}
            class="p-1 rounded-full hover:variant-ringed flex items-center"
        >
            <Icon icon={opMode === modeOverride ? "mdi:cancel" : "mdi:content-save"} />
        </button>
    {/if}
</div>
