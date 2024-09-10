/**
 * Parameter enumeration.
 * 
 * This enum defines various parameters used in communication with devices or controllers.
 * Each parameter is associated with a unique byte value that represents a specific setting or state.
 */
export enum Parameter {
    ON_OFF = 0x01,
    SPEED = 0x02,
    BOOT_MODE = 0x06,
    TIMER_MODE = 0x07,
    TIMER_COUNT_DOWN = 0x08,
    HUMIDITY_SENSOR_ACTIVATION = 0x0F,
    RELAY_SENSOR_ACTIVIATION = 0x14,
    VOLTAGE_SENSOR_ACTIVATION = 0x16, // 0-10V
    HUMIDITY_THRESHOLD = 0x19,
    CURRENT_RTC_BATTERY_VOLTAGE = 0x24, // 0-5000mv
    CURRENT_HUMIDITY = 0x25,
    CURRENT_VOLTAGE_SENSOR_STATE = 0x2D, // 0-100
    CURRENT_RELAY_SENSOR_STATE = 0x32,
    MANUAL_SPEED = 0x44,
    FAN1RPM = 0x4A,
    FAN2RPM = 0x4B,
    FILTER_TIMER = 0x64,
    RESET_FILTER_TIMER = 0x65,
    BOOST_MODE_DEACTIVATION_DELAY = 0x66, // 0-60 minutes
    RTC_TIME = 0x6F,
    RTC_CALENDAR = 0x70,
    WEEKLY_SCHEDULE = 0x72,
    SCHEDULE_SETUP = 0x77,
    SEARCH = 0x7C,
    PASSWORD = 0x7D,
    MACHINE_HOURS = 0x7E,
    RESET_ALARMS = 0x80,
    READ_ALARM = 0x83,
    CLOUD_SERVER_OPERATION_PERMISSION = 0x85,
    READ_FIRMWARE_VERSION = 0x86,
    RESTORE_FACTORY_SETTINGS = 0x87,
    FILTER_ALARM = 0x88,
    WIFI_MODE = 0x94,
    WIFI_NAME = 0x95,
    WIFI_PASSWORD = 0x96,
    WIFI_ENCRYPTION = 0x99,
    WIFI_CHANNEL = 0x9A,
    WIFI_DHCP = 0x9B,
    IP_ADDRESS = 0x9C,
    SUBNET_MASK = 0x9D,
    GATEWAY = 0x9E,
    CURRENT_IP_ADDRESS = 0xA3,
    VENTILATION_MODE = 0xB7,
    UNIT_TYPE = 0xB9
}

/**
 * Parameter details with size information.
 * 
 * An array of parameter details specifying the size in bytes for each parameter.
 */
const details: { param: number, size: number }[] = [
    { param: Parameter.ON_OFF, size: 1 },
    { param: Parameter.SPEED, size: 1 },
    { param: Parameter.BOOT_MODE, size: 1 },
    { param: Parameter.TIMER_MODE, size: 1 },
    { param: Parameter.TIMER_COUNT_DOWN, size: 3 },
    { param: Parameter.HUMIDITY_SENSOR_ACTIVATION, size: 1 },
    { param: Parameter.VOLTAGE_SENSOR_ACTIVATION, size: 1 },
    { param: Parameter.HUMIDITY_THRESHOLD, size: 1 },
    { param: Parameter.CURRENT_RTC_BATTERY_VOLTAGE, size: 2 },
    { param: Parameter.CURRENT_HUMIDITY, size: 1 },
    { param: Parameter.CURRENT_VOLTAGE_SENSOR_STATE, size: 1 },
    { param: Parameter.CURRENT_RELAY_SENSOR_STATE, size: 1 },
    { param: Parameter.MANUAL_SPEED, size: 1 },
    { param: Parameter.FAN1RPM, size: 2 },
    { param: Parameter.FAN2RPM, size: 2 },
    { param: Parameter.FILTER_TIMER, size: 3 },
    { param: Parameter.RESET_FILTER_TIMER, size: 1 },
    { param: Parameter.BOOST_MODE_DEACTIVATION_DELAY, size: 1 },
    { param: Parameter.RTC_TIME, size: 3 },
    { param: Parameter.RTC_CALENDAR, size: 4 },
    { param: Parameter.WEEKLY_SCHEDULE, size: 1 },
    { param: Parameter.SCHEDULE_SETUP, size: 6 },
    { param: Parameter.SEARCH, size: 16 },
    { param: Parameter.MACHINE_HOURS, size: 4 },
    { param: Parameter.RESET_ALARMS, size: 1 },
    { param: Parameter.READ_ALARM, size: 1 },
    { param: Parameter.CLOUD_SERVER_OPERATION_PERMISSION, size: 1 },
    { param: Parameter.READ_FIRMWARE_VERSION, size: 6 },
    { param: Parameter.RESTORE_FACTORY_SETTINGS, size: 1 },
    { param: Parameter.FILTER_ALARM, size: 1 },
    { param: Parameter.WIFI_MODE, size: 1 },
    { param: Parameter.WIFI_NAME, size: 0 },
    { param: Parameter.WIFI_PASSWORD, size: 0 },
    { param: Parameter.WIFI_ENCRYPTION, size: 1 },
    { param: Parameter.WIFI_CHANNEL, size: 1 },
    { param: Parameter.WIFI_DHCP, size: 1 },
    { param: Parameter.IP_ADDRESS, size: 4 },
    { param: Parameter.SUBNET_MASK, size: 4 },
    { param: Parameter.VENTILATION_MODE, size: 1 },
    { param: Parameter.UNIT_TYPE, size: 2 },
];

/**
 * Parameter namespace.
 * 
 * Contains utility functions for working with parameters.
 */
export namespace Parameter {
    /**
     * Gets the size in bytes for a given parameter.
     * 
     * @param {Parameter} parameter - The parameter for which to get the size.
     * @returns {number} The size in bytes of the parameter, or -1 if the parameter is unknown.
     */
    export function getSize(parameter: Parameter): number {
        const detail = details.find(d => d.param === parameter);
        return detail?.size ?? -1;
    }
}
