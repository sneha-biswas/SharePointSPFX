import { ISPList } from './HelloWorldWebPart';

export default class MockHttpClient  {

  private static _items: ISPList[] = [{ Title: 'Mock List', Application: 'ABCD', Status: 'testing' }
                                      ];

  public static get(): Promise<ISPList[]> {
    return new Promise<ISPList[]>((resolve) => {
      resolve(MockHttpClient._items);
    });
  }
}