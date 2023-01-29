<template>
    <div class="link-space" @click="hiddenMenu">
        <div class="scroll-space">
            <el-scrollbar >
                <div v-for="title in Object.keys(appList)" class="collapse-box">
                    <div 
                    class="my-header" 
                    :data-title="title" 
                    @contextmenu="showMenu"
                    >
                        {{title}}
                    </div>
                    <div class="inlink-space">
                        <div 
                        v-for="(link, index) in appList[title]" 
                        :key="link.iconDir" 
                        class="link"
                        :title="link.linkName" 
                        :data-index="index"
                        :data-title="title"
                        @dblclick="openLink"
                        @contextmenu="showMenu"
                        >
                            <img :src="link.iconDir">
                            <div>{{link.linkName}}</div>
                        </div>
                    </div>   
                </div>
            </el-scrollbar>
        </div>
        <div class="add-button" @click="changeDialogVisible">
            <el-button color='white' size="large" circle>
                <el-icon :size="25" color="#f820d3"><Plus /></el-icon>
            </el-button>
        </div>
        <el-dialog v-model="addFormVisible" title="栏位">
            <div class="input-space">
                <div class="select-input" v-if="isSelect">
                    <el-select v-model="inputStr">
                        <el-option v-for="title in Object.keys(appList)" :value="title" :label="title"></el-option>
                    </el-select>
                </div>
                <div class="new-input" v-if="!isSelect">
                    <el-input v-model="inputStr"></el-input>
                </div>
                <div class="change-button" @click="changInput">
                    <el-icon :size="20"><Sort /></el-icon>
                </div>
            </div>
            <template #footer>
                <div class="okOrNot">
                    <el-button circle @click="addApp" color="white">
                        <el-icon color="#f820d3"><Select /></el-icon>
                    </el-button>
                    <el-button circle @click="changeDialogVisible" color="white">
                        <el-icon><CloseBold /></el-icon>
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <div class="menu" v-if="menuVisible" :style="menuPosition">
            <div class="delete next-menu" @click="deleteLink">删除</div>
            <div class="mov next-menu" @click="moveLink" v-if="isLinkMenu">移动</div>
        </div>
    </div>
</template>

<script setup>
    import { ElScrollbar } from 'element-plus';
    import { ElButton } from 'element-plus';
    import { ElDialog } from 'element-plus';
    import { ElInput } from 'element-plus';
    
    import { computed, reactive, ref, watch } from 'vue-demi';

    import { useStore } from 'vuex';
    const store = useStore();

    window.getLinkList()
    .then((linkList) => {
        store.commit('initLinkList', linkList);
    })

    const appList = computed(() => {
        return store.state.appList
    })

    const addFormVisible = ref(false);
    const changeDialogVisible = () => {
        addFormVisible.value = !addFormVisible.value;
        isMove = false;
    }

    const isSelect = ref(true);
    const changInput = () => {
        isSelect.value = !isSelect.value;
    }
    const inputStr = ref('');

    const addApp = async (e) => {
        if(isMove) {
            let linkObj = {
                title,
                index,
                inputStr: inputStr.value
            }
            store.commit('moveLink', linkObj);
        }
        else {
            const res = (await window.askIsFile()).response;

            console.log(res);
            if(res !== 0) {
                const link = await window.getAppLink(res);
                store.commit('addAppList', {link, name: inputStr.value});
            }
            else {
                return 
            }
        }
        addFormVisible.value = false;
    }
    const openLink = (e) => {
        const index = e.currentTarget.dataset.index;
        const title = e.currentTarget.dataset.title;
        const dir = appList.value[title][index].dir;
        window.openLink(dir);
    }

    const menuVisible = ref(false);
    const isLinkMenu = ref(true);
    let menuPosition = reactive({});
    let index,title;

    const hiddenMenu = () => {
        menuVisible.value = false;
        menuPosition = reactive({});
    }

    const showMenu = (e) => {
        e.preventDefault();
        hiddenMenu();
        menuVisible.value = true;
        index = e.currentTarget.dataset.index;
        title = e.currentTarget.dataset.title;
        if(!index) {
            isLinkMenu.value = false;
        }
        else {
            isLinkMenu.value = true
        }
        const x = e.clientX;
        const y = e.clientY;
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        if(winWidth - 150 < x) {
            menuPosition.right = '0px';
        }
        else {
            menuPosition.left = x + 'px';
        }
        if(winHeight - 70 < y) {
            menuPosition.bottom = '0px';
        }
        else {
            menuPosition.top = y + 'px';
        }
    }

    const deleteLink = () => {
        store.commit('deleteLink', {title,index});
        hiddenMenu();
    }
    let isMove = false;
    const moveLink = () => {
        hiddenMenu();
        isMove = true;
        addFormVisible.value = true;
    }


</script>

<style lang="less" scoped>
    .link-space {
        position: relative;
        // background: linear-gradient(90deg, #ffffff, #ffffff00);
        background-color: rgba(245, 245, 245, 0.703);
        margin-left: 5px;
        .scroll-space {
            height: 100vh;
            .collapse-box {
                .my-header {
                    padding: 1vh 2vw;
                    margin: 1vh 1vw;
                    box-shadow: 0px 2px 2px 0px #676767;
                    background-color: aliceblue;
                    font-size: 14px;
                    color: #000000;
                    letter-spacing: 2px;
                    cursor: default;
                }
                .inlink-space {
                    display: flex;
                    flex-wrap: wrap;
                    flex-direction: space-around;
                    .link {
                        width: 16vw;
                        height: 16vw;
                        margin: 0.5vh 1vw;
                        padding: 0.8vw;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background-color: rgb(245 ,245 ,245);
                        border-radius: 10px;
                        cursor: pointer;
                        &:hover {
                            background-color: white;
                        }
                        img {
                            width: 65%;
                            margin-bottom: 1vh;
                        }
                        div {
                            width: 100%;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            font-size: 12px;
                            text-align: center;
                            
                        }
                    }
                }
            }
            
        }
        .add-button {
            position: absolute;
            bottom: 30px;
            right: 30px;
        }
        .input-space {
            display: flex;
            justify-content: space-around;
            align-items: center;
            .change-button {
                margin-left: 1.4vh;
                transform: translateY(0.4vh);
            }
        }
        .menu {
            position: fixed;
            background-color: rgb(245 245 245);
            border: 1px solid rgb(203 203 203);
            width: 150px;
            box-shadow: 4px 4px 3px 0px #d5d5d5;
            .next-menu {
                margin: 0px 10px;
                padding: 5px 5px;
                border-bottom: 1px rgb(203 203 203) solid;
                font-size: 14px;
                cursor: default;
            }
        }
    }
</style>