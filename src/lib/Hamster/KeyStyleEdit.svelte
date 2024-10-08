<script lang="ts">
    import Icon from "@iconify/svelte";
    import { flip } from "svelte/animate";
    import { ColorSchema, KeyStyle } from "./model/colorSchema";
    import ColorSelector from "./ColorSelector.svelte";
    import IconButton from "$lib/Component/IconButton.svelte";
    import Details from "$lib/Component/Details.svelte";
    import KeyStylePreview from "./KeyStylePreview.svelte";

    export var colorSchema: ColorSchema;
    export var keyStyles: KeyStyle[] = [];
    const sortKeyStyles = () => {
        keyStyles.sort((a, b) => (a.name < b.name ? -1 : a.name === b.name ? 0 : 1));
    };

    var keyStyle: KeyStyle = new KeyStyle();
    const copyKeyStyle = (index: number) => {
        keyStyle = keyStyles[index].clone();
    };
    const pasteKeyStyle = (index: number) => {
        keyStyles[index] = keyStyle.clone();
    };
</script>

<div class="w-full p-2 gap-1 flex flex-col rounded-md variant-soft">
    {#each keyStyles as keyStyle, index (keyStyle.id)}
        <div animate:flip={{ duration: 250 }}>
            <Details>
                <div slot="summary" class="grow flex items-center">
                    <span class="px-2 font-mono rounded variant-soft">{keyStyle.name}</span>
                    <span class="h-[48px] border-surface-500 border-r grow" />
                    <KeyStylePreview {keyStyle} {colorSchema} />
                    <KeyStylePreview pressed {keyStyle} {colorSchema} />
                    <IconButton
                        title="复制"
                        icon={"mdi:content-copy"}
                        on:click={() => copyKeyStyle(index)}
                        class="h-[48px] px-2 flex items-center variant-ringed hover:variant-ghost active:scale-95"
                    />
                    <IconButton
                        title="粘贴"
                        icon={"mdi:content-paste"}
                        on:click={() => pasteKeyStyle(index)}
                        class="h-[48px] px-2 flex items-center variant-ringed hover:variant-ghost active:scale-95"
                    />
                    <IconButton
                        title="删除"
                        icon="mdi:close"
                        on:click={() => {
                            keyStyles.splice(index, 1);
                            keyStyles = keyStyles;
                        }}
                        class="h-[48px] px-2 flex items-center variant-ringed hover:variant-ghost active:scale-95"
                    />
                </div>

                <div class="p-1 gap-1 flex flex-col">
                    <div class="h-10 w-full gap-2 flex items-center rounded-md variant-ringed">
                        <Icon icon="mdi:rename-box" class="px-1 w-10 h-8" />
                        <span class="grow shrink"> 样式唯一标识名 </span>
                        <input
                            title={"样式标识名, 不可重复.\n" +
                                "建议使用蛇形或驼峰命名: keyname_style_variant; keynameStyleVariant.\n" +
                                "如: space_light_alphabet26, returnDarkNumeric."}
                            type="text"
                            bind:value={keyStyle.name}
                            on:change={() => {
                                sortKeyStyles();
                                keyStyles = keyStyles;
                            }}
                            placeholder="space_light_eng"
                            class="h-10 w-[40%] p-1 font-mono rounded-none rounded-r-md variant-ringed hover:variant-ghost"
                        />
                    </div>
                    <ColorSelector title="背景" allowEmpty bind:color={keyStyle.buttonBackgroundColor} />
                    <ColorSelector title="按下背景" allowEmpty bind:color={keyStyle.pressedButtonBackgroundColor} />
                    <ColorSelector title="前景" allowEmpty bind:color={keyStyle.buttonForegroundColor} />
                    <ColorSelector title="按下前景" allowEmpty bind:color={keyStyle.pressedButtonForegroundColor} />
                    <ColorSelector title="划动前景" allowEmpty bind:color={keyStyle.swipeForegroundColor} />
                    <ColorSelector title="按下划动前景" allowEmpty bind:color={keyStyle.pressedSwipeForegroundColor} />
                    <ColorSelector title="按下气泡背景" allowEmpty bind:color={keyStyle.buttonBubbleBackgroundColor} />
                    <ColorSelector title="长按气泡背景" allowEmpty bind:color={keyStyle.actionCalloutBackgroundColor} />
                    <ColorSelector
                        title="长按首选背景"
                        allowEmpty
                        bind:color={keyStyle.actionCalloutSelectedBackgroundColor}
                    />
                    <ColorSelector
                        title="长按首选文字"
                        allowEmpty
                        bind:color={keyStyle.actionCalloutSelectedForegroundColor}
                    />
                    <div class="w-full gap-2 flex items-center">
                        <Icon icon="mdi:rounded-corner" class="px-1 w-10 h-8" />
                        <span class="grow shrink"> 按键圆角 </span>
                        <input type="range" min="-1" max="32" bind:value={keyStyle.cornerRadius} class="w-[30%]" />
                        <span class="w-6 code"> {keyStyle.cornerRadius} </span>
                    </div>
                    <div class="w-full gap-2 flex items-center">
                        <Icon icon="mdi:border-all-variant" class="px-1 w-10 h-8" />
                        <span class="grow shrink"> 边框宽度 </span>
                        <input type="range" min="-1" max="8" bind:value={keyStyle.borderSize} class="w-[30%]" />
                        <span class="w-6 code"> {keyStyle.borderSize} </span>
                    </div>
                    <ColorSelector title="边框" allowEmpty bind:color={keyStyle.borderColor} />
                    <ColorSelector title="下边框" allowEmpty bind:color={keyStyle.lowerEdgeColor} />
                    <ColorSelector title="阴影" allowEmpty bind:color={keyStyle.shadowColor} />
                    <div class="w-full gap-2 flex items-center">
                        <Icon icon="mdi:format-size" class="px-1 w-10 h-8" />
                        <span class="grow shrink"> 阴影大小 </span>
                        <input type="range" min="-1" max="8" bind:value={keyStyle.shadowSize} class="w-[30%]" />
                        <span class="w-6 code"> {keyStyle.shadowSize} </span>
                    </div>
                    <div class="w-full gap-2 flex items-center">
                        <Icon icon="mdi:format-size" class="px-1 w-10 h-8" />
                        <span class="grow shrink"> 键面字体大小 </span>
                        <input type="range" min="0" max="32" bind:value={keyStyle.fontSize} class="w-[30%]" />
                        <span class="w-6 code"> {keyStyle.fontSize} </span>
                    </div>
                    <div class="w-full gap-2 flex items-center">
                        <Icon icon="mdi:format-size" class="px-1 w-10 h-8" />
                        <span class="grow shrink"> 划动字体大小 </span>
                        <input type="range" min="0" max="24" bind:value={keyStyle.swipeFontSize} class="w-[30%]" />
                        <span class="w-6 code"> {keyStyle.swipeFontSize} </span>
                    </div>
                </div>
            </Details>
        </div>
    {/each}
    <button
        class="p-2 flex justify-center rounded hover:variant-ghost active:scale-95"
        on:click={() => {
            keyStyles.push(new KeyStyle());
            sortKeyStyles();
            keyStyles = keyStyles;
        }}
    >
        <Icon icon="mdi:plus" height="24" />
    </button>
</div>
