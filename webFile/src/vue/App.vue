<template>
    <Nav></Nav>
    <keep-alive>
        <files v-if="componentName.fileIsShow"></files>
    </keep-alive>
    <component :is="componentName.name"></component>
</template>

<script setup>
    import Nav from './component/Nav/Nav.vue';
    import Files from './component/Files/Files.vue';
    import VideoPlay from './component/VideoPlay/VideoPlay.vue';
    import ManHua from './component/ManHua/ManHua.vue';

    import { useStore } from 'vuex';
    const store = useStore();

    import { computed, ref } from 'vue-demi';

    const componentName = computed(() => {
        const signal = store.state.spaceSignal;
        switch (signal) {
            case 'manhua':
                return {
                    fileIsShow: false,
                    name: ManHua
                }
                break;
            case 'movie':
                return {
                    fileIsShow: false,
                    name: VideoPlay
                }
                break;
            case 'file':
                return {
                    fileIsShow: true,
                    name: null
                }
                break;
            default:
                break;
        }
    });
</script>

<style>
    body {
        margin: 0;
        padding: 0;
    }
    #app {
        height: 100vh;
        display: flex;
        flex-direction: column;
    }
</style>