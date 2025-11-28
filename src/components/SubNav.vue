<template>
    <nav class="sub-nav flex justify-between items-center p-2 bg-white/90 shadow-t">
        <button @click="prevWoche" :disabled="shift === 0" class="subnav-btn">
            <img :src="iconCircleLeft" class="h-5 w-5" alt="prevWoche" />
            <span>Woche -</span>
        </button>

        <button @click="aktWoche" class="subnav-btn">
            <img :src="iconCheck" class="h-5 w-5" alt="aktWoche" />
            <span>Heute</span>
        </button>

        <button @click="nextWoche" :disabled="shift >= maxShift" class="subnav-btn">
            <img :src="iconCircleRight" class="h-5 w-5" alt="nextWoche" />
            <span>Woche +</span>
        </button>
    </nav>
</template>

<script setup>
import { computed, defineProps } from "vue";
import { useRouter, useRoute } from "vue-router";

import iconCircleLeft from "@/assets/images/icon-circleleft.png";
import iconCheck from "@/assets/images/icon-check.png";
import iconCircleRight from "@/assets/images/icon-circleright.png";

const props = defineProps({
    maxShift: { type: Number, default: 10 }
});

const router = useRouter();
const route = useRoute();

/* Aktueller Shift aus der Route */
const shift = computed(() => Number(route.params.shift || 0));

/* Navigation */
const prevWoche = () => {
    if (shift.value > 0) {
        router.push({ name: "speiseplan", params: { shift: shift.value - 1 } });
    }
};

const aktWoche = () =>
    router.push({ name: "speiseplan", params: { shift: 0 } });

const nextWoche = () => {
    if (shift.value < props.maxShift) {
        router.push({ name: "speiseplan", params: { shift: shift.value + 1 } });
    }
};
</script>

<style scoped>
.sub-nav {
    display: flex;
    position: sticky;
    bottom: 0;
    background: #f5f5f5;
    z-index: 30;
}

.subnav-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.subnav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
</style>
