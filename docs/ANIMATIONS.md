# Animation Guide

This project uses `react-native-reanimated` for high-performance animations.

## FadeView Component

We have specific utility component for standard animations: `FadeView`.

### Usage

```tsx
import { FadeView } from '@/src/components/ui/FadeView';

// ...

<FadeView delay={300} scale>
  <Text>This content will fade in and scale up!</Text>
</FadeView>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `delay` | `number` | `0` | Delay in milliseconds before animation starts. |
| `duration` | `number` | `500` | Duration of the fade animation. |
| `scale` | `boolean` | `false` | If true, adds a spring scale animation. |
| `style` | `ViewStyle` | `undefined` | Standard React Native style object. |

## Best Practices

1.  **Use `FadeView` for entry animations**: It provides a consistent feel across the app.
2.  **Stagger animations**: Use the `delay` prop to stagger list items or elements that appear sequentially.
3.  **Performance**: `react-native-reanimated` runs on the UI thread, ensuring smooth 60fps animations even when the JS thread is busy.
