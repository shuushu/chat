import { createAction, handleActions } from 'redux-actions';
import { pender } from 'redux-pender';
import axios from 'axios';

function getPostAPI(postId) {
    return axios.get(`https://jsonplaceholder.typicode.com/posts/${postId}`)
}

const GET_POST = 'GET_POST';
/* redux-pender 의 액션 구조는 Flux standard action(https://github.com/acdlite/flux-standard-action)
 을 따르기 때문에, createAction 으로 액션을 생성 할 수 있습니다. 두번째로 들어가는 파라미터는 프로미스를 반환하는
 함수여야 합니다.
 */
export const getPost = createAction(GET_POST, getPostAPI)

const initialState = {
    // 요청이 진행중인지, 에러가 났는지의 여부는 더 이상 직접 관리 할 필요가 없어집니다. penderReducer 가 담당하기 때문이죠
    data: {
        title: '',
        body: ''
    }
}

export default handleActions({
    ...pender({
        // type이 주어지면, 이 type에 접미사를 붙인 액션 핸들러들이 담긴 객체를 생성한다.
        type: GET_POST,
        onSuccess: (state, action) => {
            const { title, body } = action.payload.data;
            return {
                data: {
                    title,
                    body
                }
            }
        }
        // 함수가 생략됐을때 기본 값으론 (state, action) => state 가 설정됩니다 (state 를 그대로 반환한다는 것이죠)
    })
}, initialState);