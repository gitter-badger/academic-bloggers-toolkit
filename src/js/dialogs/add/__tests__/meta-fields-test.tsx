import { mount } from 'enzyme';
import { observable } from 'mobx';
import * as React from 'react';
import MetaFields from '../meta-fields';

const setup = (title = 'article-journal') => {
    const meta = observable.map<string>([['type', title]]);
    const component = mount(<MetaFields meta={meta} />);
    return {
        component,
        field: component.find(`input`).first(),
        title: component.find(`h2`).text(),
    };
};

describe('<MetaFields />', () => {
    it('should render with the correct title', () => {
        let { title } = setup();
        expect(title).toBe('Journal Article');

        ({ title } = setup('article-magazine'));
        expect(title).toBe('Magazine Article');
    });
    it('should call updateField when fields are changed', () => {
        const { component, field } = setup();
        expect(component.props().meta.get('title')).toBeUndefined();
        component.props().meta.set('title', 'newTitle');
        field.simulate('change');
        expect(component.props().meta.get('title')).toBe('newTitle');
    });
});
