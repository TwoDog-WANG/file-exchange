<template>
    <div class="files-space">
        <div class="dir-name">
            <span>> </span>
            <div v-for="dir in dirArr">
                <span>{{dir}}</span>
            </div>
        </div>
        <div class="info-space">
            <div class="info-name">名称</div>
            <div class="info-size">大小</div>
        </div>
        <div class="show-space">
            <el-scrollbar>
                <div 
                v-for="(file, index) in fileList" 
                :data-index="index" 
                @click="toFile" 
                @dblclick="openFile"
                class="file-space"
                :title="file.dir"
                >
                    <div class="icon-space">
                        <el-icon>
                            <component :is="iconList[index]"></component>
                        </el-icon>
                    </div>
                    <div class="file-name">
                        {{file.dir}}
                    </div>
                    <div class="file-size" :title="`${file.size} MB`">
                        <span v-if="file.size">
                            {{file.size}} MB
                        </span>
                    </div>
                </div>
            </el-scrollbar>
        </div>

    </div>
    <el-dialog
        v-model="diaIsShow"
        width="60%"
    >
        <span>打开文件还是下载文件</span>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="downloadFile">下载</el-button>
                <el-button @click="openFile">打开</el-button>
            </span>
        </template>
    </el-dialog>
    <div class="match" v-if="isLoad">
        <div class="load-icon">
            <el-icon :size='50' class="is-loading in-icon"><Loading /></el-icon>
            <el-progress 
                :stroke-width="20" 
                :percentage="loadProgress"
                :indeterminate="noProgress"
                v-if="isLoadFile"
            >
            <el-icon color="#ff5757" @click="cancelDownload"><CircleClose /></el-icon>
            </el-progress>
        </div>
    </div>
</template>

<script setup>
    import { ElScrollbar,ElDialog,ElProgress} from 'element-plus';

    import axios from 'axios';

    import { computed, onBeforeUnmount, reactive, ref } from 'vue-demi';

    import { useStore } from 'vuex';
    const store = useStore();

    const fileList = computed(() => {
        return store.state.files
    })
    const iconList = computed(() => {
        let list = fileList.value.map((file) => {
            if(file.type === 'folder') {
                return 'Folder'
            }
            else if(file.type === 'img') {
                return 'Picture'
            }
            else if(file.type === 'music') {
                return 'Headset'
            }
            else if(file.type === 'movie') {
                return 'Film'
            }
            else {
                return 'Files'
            }
        })
        return list
    })
    const dirArr = computed(() => {
        return store.state.baseDir.slice(0, store.state.dirIndex + 1);
    })

    const isLoad = ref(false);
    const isLoadFile = ref(false);
    const diaIsShow = ref(false);
    let file = null;   
    let time = null; 
    const toFile = async (e) => {
        clearTimeout(time);
        // currentTarget在异步中会随着冒泡结束而被去除
        const index = e.currentTarget.dataset.index;
        time = setTimeout(() => {
            diaIsShow.value = true;
            file = fileList.value[index];
        }, 300);
    }
    let socket = null;
    const openFile = async (e) => {
        diaIsShow.value = false;
        let _file = file;
        if(e.type === 'dblclick') {
            clearTimeout(time);
            const index = e.currentTarget.dataset.index;
            _file = fileList.value[index];
        }
        const dirIndex = store.state.dirIndex;
        const baseDir = store.state.baseDir.slice(0, dirIndex + 1).join('');
        if(_file.type === 'folder') {
            isLoad.value = true;
            try {
                let res = await axios({
                    url: '/getfiles',
                    method: 'post',
                    data: {
                        dir: `${baseDir}${_file.dir}`,
                    },
                })
                store.commit('changeFiles', res.data);
                store.commit('pushBaseDir', [_file.dir, dirIndex]);
                isLoad.value = false;
            } catch (err) {
                isLoad.value = false;
                console.log(err);
            }
        }
        if(_file.type === 'movie') {
            let subDirArr = 
            fileList.value
            .filter((file) => {
                let reg = new RegExp(/(.srt$)|(.ass$)|(.text$)/, 'i');
                return file.type !== 'folder' && reg.test(file.dir)
            })
            .map((file) => {
                let dir = file.dir;
                let reg = new RegExp(/(.srt$)|(.ass$)|(.text$)/, 'i');
                let index = file.dir.search(reg);
                let subType = file.dir.slice(index);
                return {
                    dir,
                    subType
                }
            })
            let reg = new RegExp(/(.mp4$)|(.webp$)|(.ogg$)/, 'i');
            if(reg.test(_file.dir)) {
                store.commit('changeSignal', 'movie');
                store.commit('changeSpaceDir', {
                    fileName: _file.dir,
                    fileDir: `${baseDir}${_file.dir}`,
                    subDirArr: subDirArr,
                    needSlice: false,
                })
                store.commit('setSliceMovieInf', []);
            }
            else {
                if(window.WebSocket && window.WebSocket.prototype.send) {
                    alert('ok')
                }
                else {
                    alert('no')
                }
                let res = await axios({
                    url: '/open-websocket',
                    method: 'get'
                })
                if(res.data === 'open') {
                    console.log('servers open');
                    try {
                        socket = new WebSocket('ws://192.168.0.130:3000');
                    } catch (err) {
                        console.log(err);
                    }
                    store.commit('setSocket', socket);
                    socket.addEventListener('message', (e) => {
                        let res = JSON.parse(e.data);
                        switch (res.message) {
                            case 'connection':
                                let obj = {
                                    action: 'get part',
                                    dir: `${baseDir}${_file.dir}`
                                }
                                socket.send(JSON.stringify(obj));
                                break;
                            case 'return part':
                                store.commit('changeSignal', 'movie');
                                store.commit('changeSpaceDir', {
                                    fileName: _file.dir,
                                    fileDir: `${baseDir}${_file.dir}`,
                                    subDirArr: subDirArr,
                                    needSlice: true,
                                })
                                store.commit('setSliceMovieInf', res.data);
                                store.commit('changeFinishSingal', false);
                                break;
                            case 'start part encode':
                                let pre0 = 0;
                                let index0 = res.index;
                                store.commit('uploadSlicePre', {pre: pre0, index: index0});
                                store.commit('uploadSliceMovieInf', {message: 'start', index0});
                                break;
                            case 'return progress':
                                let pre = res.data;
                                let index = res.index;
                                store.commit('uploadSlicePre', {pre, index});
                                break;
                            case 'end part encode':
                                let pre2 = res.data;
                                let index2 = res.index;
                                store.commit('uploadSlicePre', {pre: pre2, index: index2});
                                store.commit('uploadSliceMovieInf', {message: 'end', index2});
                                break;
                            case 'finish encode':
                                store.commit('changeFinishSingal', true);
                                break;
                            default:
                                break;
                        }
                    })
                }
            }
        }
    }
    const loadProgress = ref(0);
    const noProgress = ref(false);

    const cancelSignal = new AbortController();
    const cancelDownload = () => {
        cancelSignal.abort()
    }
    const downloadFile = async () => {
        diaIsShow.value = false;
        const dirIndex = store.state.dirIndex;
        const baseDir = store.state.baseDir.slice(0, dirIndex + 1).join('');
        isLoad.value = true;
        isLoadFile.value = true;
        if(file.type === 'folder' || (file.size >= 2000 && file.size <= 8000)) {
            try {
                let res = await axios({
                    url: '/downloadbystream/bigFile',
                    method: 'post',
                    responseType: 'blob',
                    data: {
                        dir: `${baseDir}${file.dir}`,
                        type: file.type,
                    },
                    onDownloadProgress: (progresEvent) => {
                        let pro = ((progresEvent.loaded / progresEvent.total) * 100).toFixed(2);
                        if(progresEvent.total) {
                            loadProgress.value = pro;
                        }
                        else {
                            noProgress.value = true;
                        }
                    },
                    signal: cancelSignal.signal
                })
                const fileStream = res.data;
                const blob = new Blob([fileStream]);
                const href = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = href;
                const name = file.type === 'folder' ? file.dir.slice(0, -1) + '.zip' : file.dir;
                a.setAttribute('download', `${name}`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(href);
            } catch (err) {
                console.log(err);
            }
            isLoad.value = false;
            isLoadFile.value = false;
            noProgress.value = false;
        }
        else if(file.size > 8000) {
            let a = document.createElement('a');
            a.href = `/loadbya/${baseDir}${file.dir}`;
            a.download = `${file.dir}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            isLoad.value = false;
            isLoadFile.value = false;
            noProgress.value = false;
        }
        else {
            try {
                let res = await axios({
                    url: `/download/${file.type}`,
                    method: 'post',
                    data: {
                        dir: `${baseDir}${file.dir}`,
                        type: file.type,
                    },
                    responseType: 'blob',
                    onDownloadProgress: (progresEvent) => {
                        let pro = ((progresEvent.loaded / progresEvent.total) * 100).toFixed(2);
                        loadProgress.value = pro;
                    },
                    signal: cancelSignal.signal
                }) 
                const fileStream = res.data;
                const blob = new Blob([fileStream]);
                const href = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = href;
                a.download = file.dir;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(href);
                isLoad.value = false;
                isLoadFile.value = false;
            } catch (err) {
                isLoad.value = false;
                isLoadFile.value = false;
            }
        }

    }

    onBeforeUnmount(() => {
        console.log('close');
        if(socket) {
            socket.close();
        }
    })
</script>

<style lang="less" scoped>
    .match {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2000;
        background-color: #ffffff;
        .load-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-120%);
            width: 50vw;
            display: flex;
            flex-direction: column;
            .in-icon {
                align-self: center;
                margin-bottom: 1vh;
            }
        }
    }
    .files-space {
        height: 88vh;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        .dir-name {
            display: flex;
            align-items: center;
            margin-left: 1vw;
            font-size: 14px;
            overflow: hidden;
            cursor: default;
            div > span {
                width: 5vw;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
        .info-space {
            display: flex;
            align-items: center;
            height: 4vh;
            margin: 1vh 0;
            .info-name {
                width: calc(32vw + 30px);
            }
            cursor: default;
        }
        .show-space {
            height: 75vh;
            flex-grow: 1;
            .file-space {
                display: flex;
                align-items: center;
                margin: 4px 0px;
                cursor: pointer;
                .icon-space {
                    width: 2vw;
                }
                .file-name {
                    display: inline-block;
                    line-height: 30px;
                    margin: 0px 15px;
                    width: 30vw;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
                .file-size {
                    width: 20vw;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
            }
        }

    }
</style>