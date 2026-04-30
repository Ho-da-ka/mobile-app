import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ParentDateStrip from './ParentDateStrip.vue';

describe('ParentDateStrip', () => {
  it('renders correctly and generates 15 dates', () => {
    const wrapper = mount(ParentDateStrip, {
      props: {
        selectedDate: '2024-01-01'
      }
    });
    
    const items = wrapper.findAll('.date-item');
    expect(items.length).toBe(15); // -7 to +7 includes 0
  });

  it('highlights the selected date', () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const wrapper = mount(ParentDateStrip, {
      props: {
        selectedDate: todayStr
      }
    });
    
    const selectedItem = wrapper.find('.is-selected');
    expect(selectedItem.exists()).toBe(true);
    expect(selectedItem.find('.day').text()).toBe(String(today.getDate()));
  });

  it('emits select event when a date is clicked', async () => {
    const wrapper = mount(ParentDateStrip, {
      props: {
        selectedDate: '2024-01-01'
      }
    });
    
    const items = wrapper.findAll('.date-item');
    await items[0].trigger('tap');
    
    expect(wrapper.emitted()).toHaveProperty('select');
    // The first item should be 7 days ago
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - 7);
    const yyyy = expectedDate.getFullYear();
    const mm = String(expectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(expectedDate.getDate()).padStart(2, '0');
    const expectedDateStr = `${yyyy}-${mm}-${dd}`;
    
    expect(wrapper.emitted('select')![0]).toEqual([expectedDateStr]);
  });
});
