<template>
    <section>
        <h2 class="mb-1 text-sm font-semibold text-slate-800">Vertretungen</h2>
        <ul class="space-y-2 text-sm">
            <li v-for="(vp, idx) in vertretungsplan" :key="idx"
                class="cursor-pointer rounded-lg bg-amber-50 p-2 hover:bg-amber-100" @click="emitSelect(vp)">
                <h3 class="text-xs font-semibold text-amber-900">
                    {{ vp.datum.substring(11, 16) }} ({{ vp.vertretungsart }})
                </h3>
                <p class="text-xs text-amber-900">
                    {{ vp.bemerkung }}
                </p>
            </li>
        </ul>
    </section>
</template>

<script setup>
    const props = defineProps({
        vertretungsplan: { type: Array, required: true },
    });

    const emit = defineEmits(["select"]);
    const emitSelect = (vp) => emit("select", vp);
</script>