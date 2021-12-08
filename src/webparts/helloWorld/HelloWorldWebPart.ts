import { Version } from '@microsoft/sp-core-library';

import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneCheckbox,
  PropertyPaneDropdown,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './HelloWorldWebPart.module.scss';
import * as strings from 'HelloWorldWebPartStrings';
import MockHttpClient from './MockHttpClient';
import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';
import {
  Environment,
  EnvironmentType
} from '@microsoft/sp-core-library';

export interface IHelloWorldWebPartProps {
  description: string;
  test: string;
  test1: boolean;
  test2: string;
  test3: boolean;
}

export interface ISPLists {
  value: ISPList[];
}

export interface ISPList {
  Title: string;
  Application: string;
  Status:string;
}

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {

  public render(): void {
    
   /*  let title: string = '';
    let subTitle: string = '';
    let siteTabTitle: string = '';

    if (this.context.sdks.microsoftTeams) {
      // We have teams context for the web part
      title = "Welcome to Teams!";
      subTitle = "Building custom enterprise tabs for your business.";
      siteTabTitle = "We are in the context of following Team: " + this.context.sdks.microsoftTeams.context.teamName;
    }
    else
    {
      // We are rendered in normal SharePoint context
      title = "Welcome to SharePoint!";
      subTitle = "Customize SharePoint experiences using Web Parts.";
      siteTabTitle = "We are in the context of following site: " + this.context.pageContext.web.title;
    } */


    this.domElement.innerHTML = `
    <div class="${ styles.helloWorld }">
      <div class="${ styles.container }">
        <div class="${ styles.row }">
          <div class="${ styles.column }">
            <span class="${ styles.title }">Syngene Support Tracker</span>    
            <p class="${ styles.description }">Loading from ${escape(this.context.pageContext.web.title)}</p>          
          </div>
        </div>
        <div id="spListContainer" />
      </div>
    </div>`;
  
  this._renderListAsync();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private _getMockListData(): Promise<ISPLists> {
    return MockHttpClient.get()
      .then((data: ISPList[]) => {
        var listData: ISPLists = { value: data };
        return listData;
      }) as Promise<ISPLists>;
  }

  private _getListData(): Promise<ISPLists> {
    return this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('Support_Tracker-Syngene')/items`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _renderList(items: ISPList[]): void {
    let html: string = '';
    items.forEach((item: ISPList) => {
      html += `
    <ul class="${styles.list}">
      <li class="${styles.listItem}">
        <span class="ms-font-l">${item.Title}</span>       
      </li>
      <li>
      <span class="ms-font-l">${item.Application}</span>
      </li>
    </ul>`;
    });    
  
    const listContainer: Element = this.domElement.querySelector('#spListContainer');
    listContainer.innerHTML = html;
  }

  private _renderSupportList(items: ISPList[]): void {
    let html: string = '<table border=1 width=100% style="border-collapse: collapse;">';
    html += '<th>Title</th> <th>Application</th>';
    items.forEach((item: ISPList) => {
      html += `
      <tr>            
          <td>${item.Title}</td>
          <td>${item.Application}</td>    
          </tr>
          `;
    });
    html += '</table>';
      
    const listContainer: Element = this.domElement.querySelector('#spListContainer');
    listContainer.innerHTML = html;
  }

  private _renderListAsync(): void {
    // Local environment
    if (Environment.type === EnvironmentType.Local) {
      this._getMockListData().then((response) => {
        this._renderList(response.value);
      });
    }
    else if (Environment.type == EnvironmentType.SharePoint ||
             Environment.type == EnvironmentType.ClassicSharePoint) {
      this._getListData()
        .then((response) => {
          this._renderSupportList(response.value);
        });
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: 'Description'
                }),
                PropertyPaneTextField('test', {
                  label: 'Multi-line Text Field',
                  multiline: true
                }),
                PropertyPaneCheckbox('test1', {
                  text: 'Checkbox'
                }),
                PropertyPaneDropdown('test2', {
                  label: 'Dropdown',
                  options: [
                    { key: '1', text: 'One' },
                    { key: '2', text: 'Two' },
                    { key: '3', text: 'Three' },
                    { key: '4', text: 'Four' }
                  ]
                }),
                PropertyPaneToggle('test3', {
                  label: 'Toggle',
                  onText: 'On',
                  offText: 'Off'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
