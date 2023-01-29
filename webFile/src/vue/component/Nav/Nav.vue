<template>
    <div class="nav-space">
        <div class="back-forward">
            <div class="back-btn to-btn" @click="back">
                <el-icon><ArrowLeftBold /></el-icon>  
            </div>
            <div class="forward-btn to-btn" @click="forward">
                <el-icon><ArrowRightBold /></el-icon>
            </div>
        </div>
        <div class="manhua-btn" @click="toManhua">
            M
        </div>
    </div>
    <div class="match" v-loading.fullscreen.lock="isLoad">
    </div>
</template>

<script setup>
    import axios from 'axios';

    import { computed, ref } from 'vue-demi';

    import { useStore } from 'vuex';
    const store = useStore();

    const isLoad = ref(false);
    const getFiles = async (dir) => {
        try {
            let res = await axios({
                url: '/getfiles',
                method: 'post',
                data: {
                    dir,
                },
            })
            store.commit('changeFiles', res.data);
            isLoad.value = false;
        } catch (err) {
            isLoad.value = false;
            console.log(err);
        }
    }

    const back = async () => {
        let spaceSignal = store.state.spaceSignal;
        if(spaceSignal === 'file') {
            let index = store.state.dirIndex;
            if(index > -1) {
                const dir = store.state.baseDir.slice(0, index).join('');
                if(index == 0) {
                    let file = [ 
                        {dir: 'D:/', type: 'folder', id: '0', size: null},
                        {dir: 'E:/', type: 'folder', id: '1', size: null},
                        {dir: 'F:/', type: 'folder', id: '2', size: null},
                    ]
                    store.commit('changeFiles', file);
                }
                else {
                    await getFiles(dir);
                }
                index--;
                store.commit('changeDirIndex', index);
            }
        }
        else {
            store.commit('changeSignal', 'file')
        }

    }
    const forward = async () => {
        let spaceSignal = store.state.spaceSignal;
        if(spaceSignal === 'file') {
            let index = store.state.dirIndex;
            if(index < store.state.baseDir.length - 1) {
                const dir = store.state.baseDir.slice(0, index + 2).join('');
                await getFiles(dir);
                index++;
                store.commit('changeDirIndex', index);
            }
        }
    }
    const toManhua = () => {
        let spaceSignal = store.state.spaceSignal;
        if(spaceSignal === 'file') {
            store.commit('changeSignal', 'manhua')
        }
    }
</script>

<style lang="less" scoped>
    .nav-space {
        height: 5vh;
        display: flex;
        align-items: center;
        .back-forward {
            height: 100%;
            display: flex;
            align-items: center;
            .to-btn {
                height: 100%;
                display: flex;
                align-items: center;
                cursor: pointer;
            }
            .forward-btn {
                margin-left: 20px;
                cursor: pointer;
            }
        }
        .manhua-btn {
            margin-left: auto;
            margin-right: 5vw;
            box-sizing: border-box;
            width: 4.5vh;
            height: 4.5vh;
            text-align: center;
            line-height: 4.5vh;
            border-radius: 4px;
            box-shadow: 0px 0px 5px #272727;
            cursor: pointer;
        }
    }
</style>