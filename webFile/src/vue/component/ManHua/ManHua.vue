<template>
    <div class="manhua">
        <div class="img-space" v-if="isImg">
            <div class="img-show-space" ref="imgcontainer" @scroll="needLoad">
            </div>
        </div>
    </div>
</template>

<script setup>
    import axios from 'axios';
    import { ElScrollbar } from 'element-plus';

    import { computed, ref } from "vue-demi";

    import { useStore } from 'vuex';
    const store = useStore();
    const files = computed(() => {
        let reg = new RegExp(/([0-9]+)/, 'g');
        let obj = {
            img: [],
            mobi: [],
            epub: [],
            pdf: []
        }
        store.state.files
        .sort((v1, v2) => {
            let numV1 = parseInt(v1.dir.match(reg) === null ? 0 : v1.dir.match(reg).join(''));
            let numV2 = parseInt(v2.dir.match(reg) === null ? 0 : v2.dir.match(reg).join(''));
            return numV1 - numV2
        })
        .map((file) => {
            if(file.type === 'img') {
                obj.img.push(file);
            }
            else if(file.dir.endsWith('.mobi')) {
                obj.mobi.push(file);
            }
            else if(file.dir.endsWith('.epub')) {
                obj.epub.push(file);
            }
            else if(file.dir.endsWith('pdf')) {
                obj.pdf.push(file);
            }
        })
        return obj
    })

    const isImg = ref(true);

    const baseNum = 10;
    const imgSlicePartNum = parseInt((files.value.img.length / baseNum));
    let sliceIndex = 0;
    const dirIndex = store.state.dirIndex;
    const baseDir = store.state.baseDir.slice(0, dirIndex + 1).join('');

    let imgWidth = 0;

    const cancelSignal = new AbortController();
    const getSlicePart = async (sliceArr) => {
        let newArr = sliceArr.slice(sliceIndex * baseNum, (sliceIndex + 1) * baseNum);
        sliceIndex++;
        let res = await Promise.allSettled(newArr.map((file) => {
            let dir = `${baseDir}${file.dir}`;
            return axios({
                url: `/getImgByManhua`,
                method: 'post',
                data: {
                    dir,
                    type: file.type,
                },
                responseType: 'blob',
                signal: cancelSignal.signal
            }) 
        }))
        let singalEle = document.getElementsByClassName('singal')[0];
        let newSingalEle = null;
        if(singalEle) {
            newSingalEle = singalEle.cloneNode(true);
            imgcontainer.value.removeChild(singalEle);
        }
        else {
            newSingalEle = document.createElement('div');
            newSingalEle.setAttribute('class', 'singal');
            newSingalEle.style.cssText = 'width: 20px; padding: 20px; background-color: #3cbeff;'
        }
        res.map((file) => {
            let stream;
            if(file.status === 'fulfilled') {
                stream = file.value.data;
            }
            let width = parseFloat(addImg(stream));
            imgWidth += width;
        })
        imgcontainer.value.appendChild(newSingalEle);
        console.log(sliceIndex);
        if(sliceIndex <= imgSlicePartNum) {
            getSlicePart(files.value.img);
        }

    }
    const imgcontainer = ref(null);
    const addImg = (fileStream) => {
        const blob = new Blob([fileStream]);
        const src = window.URL.createObjectURL(blob);
        const img = document.createElement('img');
        img.src = src;
        img.style.cssText = 'width: 100vw;height: 100%;object-fit: contain;background-color: black;';
        // const singalEle = document.getElementsByClassName('singal')[0];
        // imgcontainer.value.insertBefore(img, singalEle);
        imgcontainer.value.appendChild(img);
        let imgWidth = img.offsetWidth;  
        return imgWidth;
    }
    const readImg = () => {
        getSlicePart(files.value.img)
    }

    // const needLoad = (e) => {
    //     const singalEle = document.getElementsByClassName('singal')[0];
    //     let scrollEnd = singalEle.getBoundingClientRect().right;
    //     if(scrollEnd > 0 && sliceIndex <= imgSlicePartNum) {
    //         jieliuGetSlicePart();
    //     }
    // }
    // const jieliuGetSlicePart = function() {
    //     let time = false;
    //     return () => {
    //         if(!time) {
    //             console.log('in');
    //             time = true;
    //             getSlicePart(files.value.img);
    //             setTimeout(() => {
    //                 time = false
    //             }, 5000);
    //         }
    //     }
    // }();

    // 暂时直接运行readImg
    readImg();

    


</script>

<style lang="less" scoped>
    .manhua {
        width: 100%;
        height: 90vh;
        flex-grow: 1;
        .img-space {
            width: 100%;
            height: 100%;
            .img-show-space {
                display: flex;
                flex-direction: row-reverse;
                width: 100%;
                height: 100%;
                overflow-x: scroll;
                scrollbar-width: none;
                -ms-overflow-style: none;
                &::-webkit-scrollbar {
                    display: none;
                }
            }
        }
    }
</style>