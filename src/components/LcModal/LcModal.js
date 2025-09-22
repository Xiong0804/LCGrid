const {
    ref,
    computed,
    toRaw,
    onMounted
} = Vue

export default {
    components: {
    },
    emits: ['hidden'],
    props: {
        /**
         * Modal的Size
         * */
        modalSize: {
            type: String,
            validator(value, props) {
                return ['modal-sm', 'modal-lg', 'modal-xl'].includes(value)
            }
        },
        closeText: {
            type: String,
            default: "取消"
        },
    },
    setup(props, {emit}) {
        const initModel = ref({})
        const updateModel = ref({})
        const modelRef = ref()

        const visible = ref(false)

        const show = (_initModel) => {
            initModel.value = _initModel ? structuredClone(toRaw(_initModel)) : _initModel
            updateModel.value = _initModel
            visible.value = true
        };

        const hide = () => {
            modelRef.value.close()
        }

        onMounted(() => {
            // 因為PrimeVue Dialog沒有BeforeHide事件，所以先自己攔截
            const originCloseEvent = modelRef.value.close
            modelRef.value.close = () => {
                const defaultFunction = () => {
                    originCloseEvent()
                    // 清空資料
                    initModel.value = {}
                    updateModel.value = {}
                    // 觸發外部事件
                    handleHidden()
                }

                defaultFunction()
            }
        })

        const handleHidden = () => {
            emit('hidden');
        };        

        const dialogWidth = computed(() => {
            // 仿照Bootstrap Modal Size
            switch (props.modalSize) {
                case 'modal-sm':
                    return '300px'
                case 'modal-lg':
                    return '800px'
                case 'modal-xl':
                    return '1140px'
                default:
                    return '500px'
            }
        })

        return {
            modelRef,
            show,
            hide,
            visible,
            dialogWidth
        };
    },
    template: `
        <!-- 新增燈箱 -->
        <div>
            <modal
                ref="modelRef"
                v-model:visible="visible"
                modal
                :draggable="false"
                :style="{ width: dialogWidth }"
                :pt="{
                    header: 'border-bottom',
                    content: 'p-3',
                    footer: 'border-top p-3'
                }">
                <template #header>
                    <slot name="header"></slot>
                </template>
                <slot name="body"></slot>
                <template #footer>
                    <!--沒cancel插槽就用預設-->
                    <button
                        v-if="!$slots.cancel"
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="modelRef.close"
                        >取消</button>
                    <slot name="cancel" :close="modelRef.close"></slot>
                    <slot name="footer"></slot>
                </template>
            </modal>
        </div>
    `,
}
