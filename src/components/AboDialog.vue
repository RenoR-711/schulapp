<template>
    <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4" @click.self="emitCancel">
        <div class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 class="mb-3 text-base font-semibold text-slate-900">
                Bitte bestätigen:
            </h2>

            <p class="mb-4 text-sm text-slate-800">
                {{ text }}
            </p>

            <div class="flex justify-end gap-2">
                <button type="button"
                    class="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    @click="emitCancel">
                    Abbrechen
                </button>
                <button type="button"
                    class="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                    @click="emitOk">
                    OK
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    text: { type: String, required: true }
});

const emits = defineEmits(['ok', 'cancel']);

const emitOk = () => emits('ok');
const emitCancel = () => emits('cancel');
</script>