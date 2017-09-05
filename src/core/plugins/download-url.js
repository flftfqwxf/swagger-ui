/* global Promise */
import {createSelector} from "reselect"
import {Map} from "immutable"
export default function downloadUrlPlugin(toolbox) {
    let {fn} = toolbox
    const actions = {
        download: (url, proxy) => ({errActions, specSelectors, specActions}) => {
            let {fetch} = fn
            url = url || specSelectors.url()
            // url = proxy ? proxy + url : url
            specActions.updateLoadingStatus("loading")
            let ajaxUrl = proxy ? proxy + encodeURIComponent(url) : encodeURIComponent(url)
            console.log('download', ajaxUrl)
            fetch({
                url: ajaxUrl,
                loadSpec: true,
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json,*/*"
                }
            }).then(next, next)
            function next(res) {
                if (res instanceof Error || res.status >= 400) {
                    specActions.updateLoadingStatus("failed")
                    return errActions.newThrownErr(new Error(res.statusText + " " + ajaxUrl))
                }
                specActions.updateLoadingStatus("success")
                specActions.updateSpec(res.text)
                specActions.updateUrl(url)
            }
        },
        saveCookie: (url, proxy, cookie) => ({errActions, specSelectors, specActions}) => {
            let {fetch} = fn
            url = url || specSelectors.url()
            // url = proxy ? proxy + url : url
            specActions.updateLoadingStatus("loading")
            let ajaxUrl = proxy ? proxy + encodeURIComponent(url) : encodeURIComponent(url)
            console.log('saveCookie', ajaxUrl)
            console.log('cookie', cookie)
            fetch({
                url: ajaxUrl,
                method: 'POST',
                loadSpec: true,
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json,*/*"
                },
                body: JSON.stringify({
                    cookie: cookie
                })
            }).then(next, next)
            function next(res) {
                if (res instanceof Error || res.status >= 400) {
                    specActions.updateLoadingStatus("failed")
                    return errActions.newThrownErr(new Error(res.statusText + " " + ajaxUrl))
                }
                specActions.updateLoadingStatus("success")
            }
        },
        updateLoadingStatus: (status) => {
            let enums = [null, "loading", "failed", "success", "failedConfig"]
            if (enums.indexOf(status) === -1) {
                console.error(`Error: ${status} is not one of ${JSON.stringify(enums)}`)
            }
            return {
                type: "spec_update_loading_status",
                payload: status
            }
        }
    }
    let reducers = {
        "spec_update_loading_status": (state, action) => {
            return (typeof action.payload === "string")
                ? state.set("loadingStatus", action.payload)
                : state
        }
    }
    let selectors = {
        loadingStatus: createSelector(
            state => {
                return state || Map()
            },
            spec => spec.get("loadingStatus") || null
        )
    }
    return {
        statePlugins: {
            spec: {actions, reducers, selectors}
        }
    }
}
