import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ShippingBarSettings, PreviewState } from '@/types/settings';

interface ProgressBarPreviewProps {
  settings: ShippingBarSettings;
  previewState: PreviewState;
  className?: string;
}

export const ProgressBarPreview: React.FC<ProgressBarPreviewProps> = ({
  settings,
  previewState,
  className
}) => {
  const { currentCartValue } = previewState;
  const { threshold, enabled, colors, barStyle, text, textAlignment, textDirection, icon, position, progressBarBorder } = settings;

  // Calculate progress percentage
  const progressPercentage = Math.min(Math.floor((currentCartValue / threshold) * 100), 100);

  // Calculate remaining amount for free shipping
  const remainingAmount = Math.max(threshold - currentCartValue, 0);
  const remainingFormatted = (remainingAmount / 100).toFixed(2);

  // Format the bar text with the remaining amount
  const formattedBarText = text.barText.replace('${remaining}', `${settings.currencySymbol || '$'}${remainingFormatted}`);

  // Determine if the threshold has been reached
  const thresholdReached = currentCartValue >= threshold;

  // If the bar is disabled, render a disabled message (for preview only)
  if (!enabled) {
    return (
      <div 
        className={cn(
          "p-4 text-center border-2 border-red-300 bg-red-50 text-red-600 rounded-md",
          className
        )}
      >
        <div className="font-medium mb-1">Free Shipping Bar is currently disabled</div>
        <div className="text-sm">Enable it in General Settings to make it visible to your customers</div>
      </div>
    );
  }

  // Define the component to render based on context
  let messageContent;

  if (thresholdReached) {
    // Success message when threshold is reached
    messageContent = (
      <div 
        className={cn(
          "p-3 text-sm text-center",
          position === 'top' ? 'border-b' : 'border-t',
          textDirection === 'rtl' ? 'rtl' : 'ltr'
        )}
        style={{ 
          backgroundColor: colors.accent + '20', // Light version of accent color
          borderColor: colors.accent,
          color: colors.accent,
          textAlign: textAlignment,
          direction: settings.textDirection
        }}
      >
        {text.successText}
      </div>
    );
  } else if (currentCartValue === 0 && text.showInitialText) {
    // Initial message when cart is empty and showInitialText is enabled
    messageContent = (
      <div 
        className={cn(
          "flex items-center mb-2",
          textAlignment === 'center' && "justify-center",
          textAlignment === 'right' && "justify-end",
          textDirection === 'rtl' ? 'rtl' : 'ltr'
        )}
        style={{ color: colors.text, direction: settings.textDirection }}
      >
        {icon.type === 'emoji' && icon.position === 'before' && <span className="mr-2">{icon.selection}</span>}
        <span>{text.initialText}</span>
        {icon.type === 'emoji' && icon.position === 'after' && <span className="ml-2">{icon.selection}</span>}
      </div>
    );
  } else {
    // Regular progress message
    messageContent = (
      <div 
        className={cn(
          "flex items-center flex-wrap break-words w-full",
          // Only add margin-bottom if text position is above
          settings.textPosition === 'above' && "mb-2",
          // Only add margin-top if text position is below
          settings.textPosition === 'below' && "mt-2",
          textAlignment === 'center' && "justify-center",
          textAlignment === 'right' && "justify-end",
          textDirection === 'rtl' ? 'rtl' : 'ltr'
        )}
        style={{ color: colors.text, direction: settings.textDirection }}
      >
        {icon.type === 'emoji' && icon.position === 'before' && <span className="mr-2">{icon.selection}</span>}
        <span>
          <span className="text-sm">{formattedBarText.split(`${settings.currencySymbol || '$'}${remainingFormatted}`)[0]}</span>
          <span className="font-medium" style={{ color: colors.highlight }}>{settings.currencySymbol || '$'}{remainingFormatted}</span>
          <span className="text-sm">{formattedBarText.split(`${settings.currencySymbol || '$'}${remainingFormatted}`)[1]}</span>
        </span>
        {icon.type === 'emoji' && icon.position === 'after' && <span className="ml-2">{icon.selection}</span>}
      </div>
    );
  }

  // Create the progress bar element that can be reordered based on text position
  const progressBarElement = (
    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.progressBg }}>
      <div 
        className={cn(
          "h-full rounded-full transition-all duration-300",
          barStyle === 'gradient' ? 'bg-gradient-to-r' : ''
        )}
        style={{ 
          width: `${progressPercentage}%`,
          backgroundColor: barStyle === 'simple' ? colors.bar : 'none',
          backgroundImage: barStyle === 'gradient' 
            ? `linear-gradient(${settings.progressDirection === 'rtl' ? 'to left' : 'to right'}, ${colors.bar}, ${colors.gradientEnd || colors.highlight})` 
            : 'none',
          border: `${progressBarBorder.thickness}px solid ${progressBarBorder.color}`,
          // For RTL direction, position the progress bar from the right side
          ...(settings.progressDirection === 'rtl' ? { 
            marginLeft: 'auto',
            marginRight: '0'
          } : {})
        }}
      />
    </div>
  );

  const contentToRender = thresholdReached ? (
    messageContent
  ) : (
    <div className="p-3 text-sm">
      {/* Conditionally render based on text position */}
      {settings.textPosition === 'above' && messageContent}
      {progressBarElement}
      {settings.textPosition === 'below' && messageContent}

      {settings.recommendedProducts && settings.recommendedProducts.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {settings.recommendedProducts.map(product => (
            <div key={product.id} className="border rounded-md p-2 flex items-center space-x-2" style={{ borderColor: settings.border.color }}>
              <img src={product.imageUrl} alt={product.name} className="h-10 w-10 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: colors.text }}>{product.name}</p>
                <p className="text-xs text-gray-500">{settings.currencySymbol || '$'}{(product.price / 100).toFixed(2)}</p>
              </div>
              <button 
                type="button" 
                className="px-2 py-1 text-xs font-medium rounded"
                style={{ 
                  backgroundColor: colors.accent + '20',
                  color: colors.accent
                }}
              >
                {text.buttonText}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div 
      className={cn(
        "overflow-hidden w-full sticky top-0 z-10",
        className
      )}
      style={{ 
        backgroundColor: colors.backgroundColor,
        borderWidth: `${settings.border.thickness}px`,
        borderStyle: 'solid',
        borderColor: settings.border.color,
        borderRadius: '0.375rem'
      }}
    >
      {contentToRender}
    </div>
  );
};