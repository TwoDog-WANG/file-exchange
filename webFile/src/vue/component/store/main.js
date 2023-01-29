import { createStore } from "vuex";

const stores = {
    state() {
        return {
            baseDir: [],
            dirIndex: -1,
            nowDir: '',
            files: [ 
                {dir: 'D:/', type: 'folder', id: '0', size: null},
                {dir: 'E:/', type: 'folder', id: '1', size: null},
                {dir: 'F:/', type: 'folder', id: '2', size: null},
            ],
            spaceSignal: 'file',
            spaceDir: {
                fileName: '',
                fileDir: '',
                subDirArr: [],
                needSlice: false
            },
            socket: null,
            sliceMovieInf: null,
            sliceMoviePre: {
                pre: 0,
                index: 0,
            },
            finishSingal: false,
        }
    },
    mutations: {
        changeDir(state, dir) {
            state.nowDir = dir;
        },
        changeDirIndex(state, index) {
            state.dirIndex = index;
        },
        pushBaseDir(state, dirArr) {
            let newArr = state.baseDir.slice(0, dirArr[1] + 1);
            newArr.push(dirArr[0]);
            state.baseDir = newArr;
            state.dirIndex = dirArr[1] + 1;
        },
        changeFiles(state, newFiles) {
            state.files = newFiles;
        },
        changeSignal(state, signal) {
            state.spaceSignal = signal;
        },
        changeSpaceDir(state, dirObj) {
            state.spaceDir.fileName = dirObj.fileName;
            state.spaceDir.fileDir = dirObj.fileDir;
            state.spaceDir.needSlice = dirObj.needSlice;
            state.spaceDir.subDirArr = dirObj.subDirArr;
        },
        setSocket(state, socket) {
            state.socket = socket
        },
        setSliceMovieInf(state, inf) {
            state.sliceMovieInf = inf
        },
        uploadSliceMovieInf(state, inf) {
            switch (inf.message) {
                case 'start':
                    state.sliceMovieInf[inf.index0].status = 'begin'
                    break;
                case 'end':
                    state.sliceMovieInf[inf.index2].status = 'end';
                    break;
                default:
                    break;
            }
        },
        uploadSlicePre(state, pre) {
            state.sliceMoviePre = pre;
        },
        changeFinishSingal(state, signal) {
            state.finishSingal = signal;
        }
    }
}

const store = createStore(stores);

export default store