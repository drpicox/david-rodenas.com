export const AppComponent = {
  template: `
    <app-header></app-header>
    <div drpx-class-route-loading class="drpx-route-loading">
      <ng-view autoscroll></ng-view>
    </div>
    <div class="flex layout-row">
      <div drpx-remove-on-route-success>      
        <i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
      </div>
    </div>
    <app-footer></app-footer>
  `,
}
