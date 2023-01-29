<template>
    <div class="play-space">
        <div class="video-title">
            <span>{{title}}</span>
            <div class="slice-space">
                <div class="slice-btn" @click="changeShowSliceList">
                    <Tickets class="slice-svg" />
                </div>
                <keep-alive>
                    <div class="slice-list" v-if="showSliceList">
                        <div class="list-space">
                            <el-scrollbar>
                                <div 
                                v-for="(inf, index) in sliceMovieInf" 
                                :key="inf.duration.start" 
                                :data-index="index" 
                                @dblclick="playPart"
                                class="progress-box"
                                >
                                    <div class="encode-progress" :style="inf.progressStyle"></div>
                                    <div class="time-space">
                                        <span>第 {{index + 1}} 章节:  </span> 
                                        <span class="duration-time">{{inf.time.startTime}} ~ {{inf.time.endTime}}</span>
                                        <el-icon :color="!inf.isFinish ? '#00dcff' : '#ff0086'" :class="{'is-loading': !inf.isInit && !inf.isFinish}">
                                            <component :is="!inf.isFinish ? 'Loading' : 'Select'"></component>
                                        </el-icon>
                                    </div>
                                </div>
                                <div class="chose-sub">
                                    <span>字幕: </span>
                                    <el-select v-model="selectSub" placeholder="添加字幕" clearable >
                                        <el-option
                                        v-for="subDir in dirObj.subDirArr"
                                        :key="subDir.dir"
                                        :value="subDir.dir"
                                        >
                                        <!-- <span style="float: left">{{ subDir.subType }}</span> -->
                                            <div class="sub-item-space" :title="subDir.dir">
                                                <div class="name">
                                                    {{subDir.dir}}
                                                </div>
                                                <div class="type">
                                                    {{subDir.subType.slice(1)}}
                                                </div>
                                            </div>
                                        </el-option>
                                    </el-select>
                                </div>
                            </el-scrollbar>
                        </div>
                        <div class="encode-btn-space">
                            <div class="play-btn btn" v-if="canPlay" @click="playMovie">播放</div>
                            <div class="encode-btn btn" v-if="notEncode" @click="beginEncode">开始编码</div>
                            <div class="cancel-btn btn" v-else-if="!notEncode && !finishEncode">取消编码</div>
                        </div>
                        
                    </div>
                </keep-alive>

            </div>
        </div>
        <div class="video-space">
            <video
            class="myvideo"
            ref="myvideo"
            preload="auto"
            :src="url"
            controls
            @ended="playEnd"
            >
                <track
                default
                kind="subtitles"
                :src="trackUrl"
                >
            </video> 
            <!-- <div :class="['video-control', {'show-control': conIsShow}]">
                <div class="back-btn btn"></div>
                <div class="play-btn-space">
                    <div :class="['play-btn', 'btn', {'btn-show': isPuse, 'btn-hidden': !isPuse}]">
                        <el-icon><VideoPlay /></el-icon>
                    </div>
                    <div :class="['pause-btn', 'btn', {'btn-show': !isPuse, 'btn-hidden': isPuse}]">
                        <el-icon><VideoPause /></el-icon>
                    </div>
                </div>
                <div class="forward-btn btn"></div>
                <div class="progress-space"></div>
                <div class="volume-space"></div>
                <div class="track-space"></div>
            </div> -->
        </div>
    </div>
</template>

<script setup>
    import axios from 'axios';
    import { ElScrollbar,ElSelect,ElOption } from 'element-plus';

    import { computed, nextTick, reactive, ref, watch} from 'vue-demi';

    import { useStore } from 'vuex';
    const store = useStore();

    const myvideo = ref(null);
    const dirObj = computed(() => {
        return store.state.spaceDir
    })
    const title = ref(dirObj.value.fileName);
    const url = ref('');

    const showSliceList = ref(false);
    const changeShowSliceList = () => {
        showSliceList.value = !showSliceList.value
    }
    const sliceMovieInf = computed(() => {
        if(store.state.sliceMovieInf) {
            return store.state.sliceMovieInf.map((val) => {
                if(val.status === 'init') {
                    val.isInit = true;
                    val.isFinish = false;
                }
                else if(val.status === 'begin') {
                    val.isInit = false;
                    val.isFinish = false;
                    notEncode.value = false;
                }
                else {
                    val.isInit = false;
                    val.isFinish = true;
                    canPlay.value = true;
                    if(needContinuePlay) {
                        needContinuePlay = false;
                        playMovieIndex++;
                        playMovie('', playMovieIndex);
                    }
                }
                return val
            })
        }

    })

    if(!dirObj.value.needSlice) {
        url.value = `/onlinePlay/${dirObj.value.fileDir}`;
    }
    else {
        showSliceList.value = true;
    }

    const canPlay = ref(false);
    const notEncode = ref(true);
    const socket = store.state.socket;
    const selectSub = ref('');
    const trackUrl = ref('')
    const beginEncode = async () => {
        if(dirObj.value.needSlice) {
            let obj = {
                action: 'encode movie',
                dir: dirObj.value.fileDir,
                parts: sliceMovieInf.value,
                subDir: selectSub.value,
            }
            socket.send(JSON.stringify(obj));
        }
        else if(selectSub.value) {
            let dir = `${dirObj.value.fileDir.split('/').slice(0, -1).join('/')}/${selectSub.value}`
            let res = await axios({
                url: '/gettrack',
                method: 'post',
                data: {
                    dir,
                },
                responseType: 'blob',
            })
            const fileStream = res.data;
            const blob = new Blob([fileStream]);
            const url = window.URL.createObjectURL(blob);
            trackUrl.value = url
        }
    }
    const pre = computed(() => {
        return store.state.sliceMoviePre
    })
    watch(pre, (pre) => {
        if(sliceMovieInf.value[pre.index].progressStyle) {
            sliceMovieInf.value[pre.index].progressStyle.width = `${pre.pre}%`;
        }
    })
    const finishEncode = computed(() => {
        return store.state.finishSingal
    })
    let playMovieIndex = 0;
    let needContinuePlay = false;
    const playMovie = (e, _playMovieIndex = 0) => {
        let dir = `F:/movieCatch/${_playMovieIndex + 1}.mp4`;
        url.value = `/onlinePlay/${dir}`;
        nextTick(() => {
            myvideo.value.play();
        })
    }
    const playEnd = (e) => {
        if(dirObj.value.needSlice && playMovieIndex <= sliceMovieInf.value.length - 1) {
            if(sliceMovieInf.value[playMovieIndex].isFinish) {
                playMovieIndex++;
                needContinuePlay = false;
                playMovie('', playMovieIndex)
            }
        }
        else {
            needContinuePlay = true;
        }
    }
    const playPart = (e) => {
        let index = e.currentTarget.dataset.index;
        if(sliceMovieInf.value[playMovieIndex].isFinish) {
            playMovieIndex = index;
            needContinuePlay = false;
            playMovie('', index)
        }
    }
</script>

<style lang="less" scoped>
    // @basecolor: #00aeec;
    video::cue {
        font-size: 22px;
    }
    .sub-item-space {
        width: 50vw;
        display: flex;
        justify-content: space-around;
        align-items: center;
        .name {
            width: 40vw;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
    .play-space {
        height: 75vh;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        .video-title {
            padding: 1vh 1vw;
            display: flex;
            justify-content: space-between;
            align-items: center; 
            .slice-space {
                position: relative;
                .slice-btn {
                    display: flex;
                    align-items: center;
                    .slice-svg {
                        height: 3vh;
                    }
                }
                .slice-list {
                    position: absolute;
                    z-index: 2;
                    left: 0;
                    top: 0;
                    transform: translateX(-102%);
                    width: 60vw;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background-color: rgb(255 255 255);
                    padding: 10px;
                    border: 1px white solid;
                    border-radius: 5px;
                    box-shadow: 0 0 8px 0px #c6c6c6;
                    .list-space {
                        width: 100%;
                        max-height: 70vh;
                        .progress-box {
                            width: 100%;
                            position: relative;
                            margin: 1vh 0px;
                            .encode-progress {
                                height: 5vh;
                                border-radius: 10px;
                                border-top-left-radius: 0px;
                                background-color: #00aeec;
                            }
                            .time-space {
                                position: absolute;
                                left: 1vw;
                                top: 50%;
                                transform: translateY(-50%);
                                font-size: 2vh;
                                font-family: Helvetica Neue,Helvetica,Arial,Microsoft Yahei,Hiragino Sans GB,Heiti SC,WenQuanYi Micro Hei,sans-serif;;
                                .duration-time {
                                    color: #61666d;
                                }
                                &>i {
                                    position: absolute;
                                    left: 55vw;
                                    top: 0.5vh;
                                }
                            }
                        }
                        .chose-sub {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            margin: 10px 0;
                            & > span {
                                margin-right: 10px;
                            }
                        }
                    }
                    
                    .encode-btn-space {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin: 1vh;
                        .btn {
                            width: 10vw;
                            padding: 5px 10px;
                            margin: 0 2vw;
                            font-size: 16px;
                            text-align: center;
                            border: 1px #00b8ff solid;
                            border-radius: 5px;
                            box-shadow: 0px 0px 2px #00b9ff;
                            cursor: pointer;
                            &:hover {
                                color: white;
                                background-color: #00b9ff;
                            }
                        }
                        .cancel-btn {
                            &:hover {
                                color: rgb(61, 61, 61);
                                background-color: #fb1717;
                                box-shadow: 0px 0px 2px #fb1717;
                            }
                        }
                    }
                }
            }

        }
        .video-space{
            width: 100vw;
            height: 70vh;
            flex-grow: 1;
            position: relative;
            overflow: hidden;
            .myvideo{
                width: 100%;
                height: 100%;
                background-color: black;
            }
            .video-control {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100vw;
                height: 6vh;
                display: flex;
                flex-direction: row;
                align-items: center;
                background-color: azure;
            }
        }
    }
</style>